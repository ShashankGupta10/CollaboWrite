import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import Navbar from "./Navbar";
import ReactQuill from "react-quill";
import { Editor as CodeEditor } from "@monaco-editor/react";
import "react-quill/dist/quill.snow.css"; // Import Quill styles

const SAVE_INTERVAL_MS = 4000;

const TextEditor = () => {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState(null);
  const [value, setValue] = useState("");
  const [codeValue, setCodeValue] = useState("");
  const [codeMode, setCodeMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState("100%");

  useEffect(() => {
    const handleResize = () => {
      const editorContainer = document.querySelector("#editor-container");
      if (editorContainer)
        setContainerWidth(`${editorContainer.clientWidth}px`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const sock = io("https://collabowrite-server.onrender.com");
    setSocket(sock);

    return () => {
      sock.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("receive_changes", (delta) => {
      setValue(delta);
    });

    socket.on("receive_code_changes", (delta) => {
      setCodeValue(delta);
    });

    socket.once("load_document", (document) => {
      setValue(document);
    });

    socket.once("load_code_document", (document) => {
      setCodeValue(document);
    });

    socket.emit("get_document", documentId);
    socket.emit("get_code_document", documentId);

    return () => {
      socket.off("receive_changes");
      socket.off("receive_code_changes");
    };
  }, [socket, documentId]);

  useEffect(() => {
    if (!socket) return;

    const interval = setInterval(() => {
      socket.emit("save_document", value.toString("html"));
      socket.emit("save_code_document", codeValue.toString("html"));
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, value, codeValue]);

  const onTextChange = (newValue) => {
    setValue(newValue);
    if (socket) {
      socket.emit("send_changes", newValue.toString("html"));
    }
  };

  const onCodeChange = (newValue) => {
    if (socket) {
      socket.emit("send_code_changes", newValue.toString("html"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Navbar code={codeMode} setCode={setCodeMode} />
      <div className="text-editor flex justify-center">
        {!codeMode ? (
          <ReactQuill
            value={value}
            onChange={onTextChange}
            theme="snow"
            className="w-[800px] h-[700px]"
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
              value={codeValue}
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
