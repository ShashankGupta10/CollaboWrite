const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const Document = require("./models/Doc");
const { kv } = require("@vercel/kv");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
app.use(cors());
const io = require("socket.io")(server, {
  cors: {
    origin: "http://192.168.31.182:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});

// Function to get document data from Redis cache or MongoDB
const getDocumentData = async (document_id) => {
  const value = await kv.get(document_id);
  if (value && value != " ") {
    console.log("found from redis", value);
    return value;
  } else {
    console.log("finding in db");
    const document = await Document.findById(document_id);
    if (document) {
      await kv.set(document_id, document.data, { ex: 2000, nx: true });
      return document.data;
    } else {
      const document = await Document.create({
        _id: document_id,
        data: "",
        code: "",
      });
      return document.data;
    }
  }
};

const getCodeDocument = async (document_id) => {
  const value = await kv.get(`${document_id}_code`);
  if (value && value != " ") {
    console.log("found from redis", value);
    return value;
  } else {
    console.log("finding in db");
    const document = await Document.findById(document_id);
    if (document) {
      await kv.set(`${document_id}_code`, document.code, {
        ex: 2000,
        nx: true,
      });
      return document.code;
    } else {
      const document = await Document.create({
        _id: document_id,
        code: "",
        data: "",
      });
      return document.code;
    }
  }
};

// Socket.io connection
io.on("connection", (socket) => {
  console.log("connected to socket");
  socket.on("get_document", async (document_id) => {
    let documentData = await getDocumentData(document_id);
    socket.join(document_id);
    socket.emit("load_document", documentData);

    socket.on("send_changes", (delta) => {
      socket.broadcast.to(document_id).emit("receive_changes", delta);
    });
    socket.on("save_document", async (data) => {
      console.log("saving brooo");
      await Document.findByIdAndUpdate(document_id, { data: data });
      await kv.set(document_id, data, { ex: 2000, nx: true });
    });
  });
});

io.on("connection", (socket) => {
  console.log("connected to socket");
  socket.on("get_code_document", async (document_id) => {
    let documentData = await getCodeDocument(document_id);
    socket.join(document_id);
    socket.emit("load_code_document", documentData);

    socket.on("send_code_changes", (delta) => {
      socket.broadcast.to(document_id).emit("receive_code_changes", delta);
    });
    socket.on("save_code_document", async (code) => {
      console.log("saving brooo");
      await Document.findByIdAndUpdate(document_id, { code: code });
      await kv.set(`${document_id}_code`, code, { ex: 2000, nx: true });
    });
  });
});

const start = async () => {
  mongoose
    .connect(process.env.MONGO_DB_URI)
    .then(() => console.log("Database connected!"))
    .catch((err) => console.log(err));

  const port = process.env.PORT || 3000;
  server.listen(port, "192.168.31.182", () => {
    console.log(`Server is running on port ${port}`);
  });
};

start();
