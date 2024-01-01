const mongoose = require("mongoose");

const document_schema = new mongoose.Schema({
    _id: String,
    data: Object,
});
const Document = mongoose.model("Document", document_schema);
module.exports = Document;
