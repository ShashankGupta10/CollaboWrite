const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const Document = require("./models/Doc");
const redis = require("redis");
require("dotenv").config();

const redis_client = redis.createClient({
  host: "172.21.87.61",
  port: 6379,
});

console.log(redis_client);
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

  const value = await redis_client.get(document_id);
  console.log(value);
  if (value) return value;
  else {
    const document = await Document.findById(document_id);
    if (document && document !== "") {
      console.log("hehe", document);
      redis_client.setEx(document_id, 200, document.data);
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
      redis_client.setEx(document_id, 200, data);
    });
  });
});

const start = async () => {
  mongoose
    .connect(process.env.MONGO_DB_URI)
    .then(() => console.log("Database connected!"))
    .catch((err) => console.log(err));

  const port = process.env.PORT || 3000;
  server.listen(port, "192.168.0.104", () => {
    console.log(`Server is running on port ${port}`);
  });
  await redis_client.connect();
  redis_client.on("connection", () => {
    console.log("connected to redis hehe");
  });
  console.log("connected to redis");
  await redis_client.set("key", "value");
  const value = await redis_client.get("key");
  console.log(value);
};

start();
