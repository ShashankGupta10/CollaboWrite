import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
const SAVE_INTERVAL_MS = 2000;

const TextEditor = () => {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [value, setValue] = useState("");
  const ref = useRef(null);
  const [code, setCode] = useState(false);
  useEffect(() => {
    // Hide or show the menubar based on the state of showMenubar
    if (ref.current && ref.current.editorContainer) {
      const menubar = ref.current.editorContainer.querySelector(
        ".tox-toolbar__menubar"
      );
      if (menubar) {
        menubar.style.display = code ? "block" : "none";
      }
    }
  }, [code]);

  useEffect(() => {
    const sock = io("http://192.168.0.104:3000/");
    console.log(sock);
    setSocket(sock);
    return () => sock.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (delta) => {
      setValue(delta);
    };
    socket.on("receive_changes", handler);
    return () => socket.off("receive_changes", handler);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.once("load_document", (document) => {
      const htmlDocument = typeof document === "string" ? document : "";
      setValue(htmlDocument);
      // setValue(RichTextEditor.createValueFromString(document, "html"));
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

  const onChange = (newValue) => {
    // setValue(newValue);
    if (socket) {
      socket.emit("send_changes", newValue.toString("html"));
    }
  };

  return !code ? (
    <>
      <button onClick={() => setCode(!code)} className="">
        {code ? "Hide Menubar" : "Show Menubar"}
      </button>
      <Editor
        value={value}
        apiKey="1ut461hpre28zus25bxayf1zjz1vjvnb0bzhueoy4wxwqser"
        onChange={onChange}
        onInit={(_evt, editor) => (ref.current = editor)}
        ref={ref}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
    </>
  ) : (
    <>
      <button onClick={() => setCode(!code)}>
        {code ? "Hide Menubar" : "Show Menubar"}
      </button>
      <textarea></textarea>
    </>
  );
};

export default TextEditor;
