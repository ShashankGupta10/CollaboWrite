import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import RichTextEditor from "react-rte";

const SAVE_INTERVAL_MS = 2000;

const TextEditor = () => {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [value, setValue] = useState(RichTextEditor.createEmptyValue());

  useEffect(() => {
    const sock = io("https://majestic-dango-b13e09.netlify.app/");
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
      toolbarStyle={{
        display: "flex",
        justifyContent: "center",
        border: "none",
        borderRadius: "4px",
        height: "50px",
        width: "100%",
        padding: "10px",
        boxSizing: "border-box",
        fontFamily: "'Roboto', sans-serif",
        fontSize: "16px",
        lineHeight: "1.5",
      }}
      editorStyle={{
        border: "none",
        borderRadius: "4px",
        height: "50%",
        width: "100%",
        padding: "10px",
        boxSizing: "border-box",
        fontFamily: "'Roboto', sans-serif",
        fontSize: "16px",
        lineHeight: "1.5",
        color: "#333",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    />
  );
};
export default TextEditor;
