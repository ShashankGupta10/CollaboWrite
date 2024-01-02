import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import RichTextEditor from "react-rte";
import "./TextEditor.css";

const SAVE_INTERVAL_MS = 2000;

const TextEditor = () => {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [value, setValue] = useState(RichTextEditor.createEmptyValue());

  useEffect(() => {
    const sock = io("https://collabowrite-server.onrender.com/");
    console.log(sock);
    setSocket(sock);
    return () => sock.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (delta) =>
      setValue(RichTextEditor.createValueFromString(delta, "html"));
    socket.on("receive_changes", handler);
    return () => socket.off("receive_changes", handler);
  }, [socket]);
  useEffect(() => {
    if (!socket) return;
    socket.once("load_document", (document) => {
      setValue(RichTextEditor.createValueFromString(document, "html"));
    });
    socket.emit("get_document", documentId);
  }, [socket, documentId]);
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      socket.emit("save_document", value.toString("html"));
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [socket, value]);
  const onChange = (value) => {
    setValue(value);
    socket.emit("send_changes", value.toString("html"));
  };
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      toolbarClassName="rte-toolbar"
      editorClassName="rte-editor"
      placeholder="Start writing..."
    />
  );
};
export default TextEditor;
