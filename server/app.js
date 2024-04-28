const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const Document = require("./models/Doc");
const kv = require("@vercel/kv").kv;
require("dotenv").config();

const app = express();
const server = http.createServer(app);
app.use(cors());
const io = require("socket.io")(server, {
  cors: {
    origin: "http://192.168.0.104:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});

// Function to get document data from Redis cache or MongoDB
const getDocumentData = async (document_id) => {
  console.log("here");

  const value = await kv.get(document_id);
  console.log(value);
  if (value) return value;
  else {
    const document = await Document.findById(document_id);
    if (document && document !== "") {
      console.log("hehe", document);
      kv.setex(document_id, 200, document.data);
    } else {
      return null;
    }
  }
};

// Socket.io connection
io.on("connection", (socket) => {
  console.log("connected to socket");
  socket.on("get_document", async (document_id) => {
    console.log(document_id);
    let documentData = await getDocumentData(document_id);
    console.log(documentData);
    socket.join(document_id);
    socket.emit("load_document", documentData);

    socket.on("send_changes", (delta) => {
      socket.broadcast.to(document_id).emit("receive_changes", delta);
    });
    console.log(documentData);
    socket.on("save_document", async (data) => {
      // Update MongoDB document
      console.log(data);
      await Document.findByIdAndUpdate(document_id, { data: data });

      // Update Redis cache
      kv.setex(document_id, 200, data);
    });
  });
});

const start = async () => {
  mongoose
    .connect(process.env.MONGO_DB_URI)
    .then(() => console.log("Database connected!"))
    .catch((err) => console.log(err));

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

start();
