import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as CodeEditor } from "@monaco-editor/react";
import Navbar from "./Navbar";
const SAVE_INTERVAL_MS = 2000;

const TextEditor = () => {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [value, setValue] = useState("");
  const [code_value, set_code_value] = useState("");
  const [code, setCode] = useState(false);
  const ref = useRef(null);
  const [containerWidth, setContainerWidth] = useState("100%");

  // resize function for responsiveness of editor
  useEffect(() => {
    const handleResize = () => {
      const editorContainer = document.querySelector("#editor-container");
      if (editorContainer)
        setContainerWidth(
          `${document.getElementById("editor-container").clientWidth}px`
        );
    };

    handleResize(); // Set initial width
    window.addEventListener("resize", handleResize); // Listen for window resize events

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup
    };
  }, []);

  // establish socket connection with the backend server
  useEffect(() => {
    const sock = io("http://192.168.31.182:3000/");
    setSocket(sock);
    return () => sock.disconnect();
  }, []);

  // handle changes received from the socket
  useEffect(() => {
    if (!socket) return;
    const handler = (delta) => {
      setValue(delta);
    };
    socket.on("receive_changes", handler);
    return () => socket.off("receive_changes", handler);
  }, [socket]);

  // fetching document data from the backend
  useEffect(() => {
    if (!socket) return;
    socket.once("load_document", (document) => {
      const htmlDocument = typeof document === "string" ? document : "";
      setValue(htmlDocument);
    });
    socket.emit("get_document", documentId);
  }, [socket, documentId]);

  // saving document on every SAVE_INTERVAL_MS milliseconds of inactivity
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      socket.emit("save_document", value.toString("html"));
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [socket, value]);

  // sending changes to the backend whenever changes are made by the user
  const onChange = (newValue) => {
    if (socket) {
      socket.emit("send_changes", newValue.toString("html"));
    }
  };

  // handle changes received from the socket
  useEffect(() => {
    if (!socket) return;
    const handler = (delta) => {
      set_code_value(delta);
    };
    socket.on("receive_code_changes", handler);
    return () => socket.off("receive_code_changes", handler);
  }, [socket]);

  // fetching document data from the backend
  useEffect(() => {
    if (!socket) return;
    socket.once("load_code_document", (document) => {
      const htmlDocument = typeof document === "string" ? document : "";
      set_code_value(htmlDocument);
    });
    socket.emit("get_code_document", documentId);
  }, [socket, documentId]);

  // saving document on every SAVE_INTERVAL_MS milliseconds of inactivity
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      socket.emit("save_code_document", code_value.toString("html"));
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [socket, code_value]);

  const onCodeChange = (newValue) => {
    if (socket) {
      socket.emit("send_code_changes", newValue.toString("html"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Navbar code={code} setCode={setCode} />
      <div className="text-editor flex justify-center">
        {!code ? (
          <Editor
            value={value}
            apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
            onEditorChange={onChange}
            onInit={(_evt, editor) => (ref.current = editor)}
            ref={ref}
            init={{
              height: 600,
              width: 900,
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
        ) : (
          <div
            className="code-editor rounded-lg border border-gray-300 overflow-hidden"
            style={{ width: containerWidth }}
          >
            <CodeEditor
              height={"600px"}
              width={"100%"}
              onChange={onCodeChange}
              className="rounded-md"
              language={"python"}
              theme={"vs-dark"}
              path={"script.js"}
              value={code_value}
              options={{
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: 16,
                lineHeight: 24,
                padding: 20,
                borderRadius: "10px",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEditor;
