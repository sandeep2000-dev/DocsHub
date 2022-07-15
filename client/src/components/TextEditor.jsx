import ReactQuill from "react-quill";
import { useState, useEffect, useRef, useMemo } from "react";
import "react-quill/dist/quill.snow.css";
// import "react-quill/dist/quill.bubble.css";

function TextEditor(props) {
  //   const [editorData, setEditorData] = useState({});
  const quillRef = useRef();

  const toolbarOptions = [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }, { align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ];

  const quillImageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const file = e.currentTarget.files[0];
      let formData = new FormData();
      formData.append("file", file);

      fetch(`http://localhost:4000/doc/${props.docId}/uploadfiles`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.status);
          return res.json();
        })
        .then((data) => {
          if (data.status === "success") {
            let editor = quillRef.current.getEditor();
            editor.focus();
            const range = editor.getSelection();
            editor.insertEmbed(
              range.index,
              "image",
              `http://localhost:4000/${data.url}`
            );
            editor.setSelection(range.index + 1);
          } else throw new Error(data.err);
        })
        .catch((e) => console.log(e));
    };
  };

  const quillVideoHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "video/*");
    input.click();
    input.onchange = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const file = e.currentTarget.files[0];
      let formData = new FormData();
      formData.append("file", file);

      fetch(`http://localhost:4000/doc/${props.docId}/uploadfiles`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error(res.status);
          return res.json();
        })
        .then((data) => {
          if (data.status === "success") {
            let editor = quillRef.current.getEditor();
            editor.focus();
            const range = editor.getSelection();
            editor.insertEmbed(
              range.index,
              "video",
              `http://localhost:4000/${data.url}`
            );
            editor.setSelection(range.index + 1);
          } else throw new Error(data.err);
        })
        .catch((e) => console.log(e));
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarOptions,
        handlers: {
          image: quillImageHandler,
          video: quillVideoHandler,
        },
      },
    }),
    []
  );

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={props.editorData || ""}
      onChange={(v, d, s, editor) => props.setEditorData(editor.getContents())}
      modules={modules}
    />
  );
}

export default TextEditor;
