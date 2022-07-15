import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../css/doceditor.css";
import TextEditor from "../components/TextEditor";

function DocEditor() {
  let params = useParams();
  const navigate = useNavigate();
  const [editorData, setEditorData] = useState({});
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
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
      .then((data) => console.log("save", data))
      .catch((e) => console.log(e));
  }

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
      <TextEditor
        docId={params.id}
        setEditorData={setEditorData}
        editorData={editorData}
      />
    </div>
  );
}

export default DocEditor;
