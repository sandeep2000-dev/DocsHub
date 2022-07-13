import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { useEffect, useState, useRef } from "react";
import "../css/doceditor.css";

function DocEditor() {
  let params = useParams();
  const navigate = useNavigate();
  const [editorData, setEditorData] = useState({});
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const quillRef = useRef();
  const titleRef = useRef();
  const isFirstRender = useRef(true);

  useEffect(() => {
    fetch(`http://localhost:4000/doc/${params.id}/edit`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status);
      })
      .then((data) => {
        if (data.status === "success") {
          setEditorData(data.doc.data);
          setTitle(data.doc.title);
          setIsPublic(data.doc.isPublic);
          isFirstRender.current = false;
        } else if (data.status === "fail") {
          console.log(data.mssg);
          navigate("/");
        } else throw new Error(data.err);
      })
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    titleRef.current.focus();
  }, [title]);

  useEffect(() => {
    if (!isFirstRender.current) handleSave();
  }, [isPublic]);

  function handleSave() {
    fetch(`http://localhost:4000/doc/${params.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: editorData,
        title: title,
        isPublic: isPublic,
      }),
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status);
      })
      .then((data) => console.log(data))
      .catch((e) => console.log(e));
  }

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

      fetch(`http://localhost:4000/doc/${params.id}/uploadfiles`, {
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

      fetch(`http://localhost:4000/doc/${params.id}/uploadfiles`, {
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

  const modules = {
    toolbar: {
      container: toolbarOptions,
      handlers: {
        image: quillImageHandler,
        video: quillVideoHandler,
      },
    },
  };

  return (
    <div className="doceditor">
      <div className="doceditor_top">
        <div className="doceditor_title">
          <label htmlFor="title">Title</label>
          <input
            ref={titleRef}
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <button onClick={handleSave}>Save</button>
        <button
          onClick={() => {
            setIsPublic((prev) => !prev);
          }}
        >
          Make {isPublic ? "Private" : "Public"}
        </button>
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorData || ""}
        onChange={(v, d, s, editor) => setEditorData(editor.getContents())}
        modules={modules}
      />
    </div>
  );
}

export default DocEditor;
