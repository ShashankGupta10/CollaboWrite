const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const Document = require("./models/Doc");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
app.use(cors());
const io = require("socket.io")(server, {
  cors: {
    origin: "https://collabowrite.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});
const find_or_create_document = async (id) => {
  let document;
  try {
    if (!id) document = await Document.create({ _id: id, data: "" });
    else {
      document = await Document.findOne({ _id: id });
      if (!document) document = await Document.create({ _id: id, data: "" });
    }
  } catch (err) {
    console.error(`Error finding or creating document: ${err}`);
    throw new Error("Error finding or creating document");
  }
  console.log(document);
  return document;
};

io.on("connection", (socket) => {
  console.log("connected");
  socket.on("get_document", async (document_id) => {
    let document = await find_or_create_document(document_id);
    console.log(document);
    socket.join(document._id);
    socket.emit("load_document", document.data);

    socket.on("send_changes", (delta) => {
      socket.broadcast.to(document._id).emit("receive_changes", delta);
    });
    socket.on("save_document", async (data) => {
      console.log(document);
      await Document.findOneAndUpdate(
        { _id: document._id },
        {
          $set: {
            data: data,
          },
        }
      );
    });
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => console.log("Database connected!"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
