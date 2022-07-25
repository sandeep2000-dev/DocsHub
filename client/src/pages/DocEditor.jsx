import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../css/doceditor.css";
import TextEditor from "../components/TextEditor";
import { io } from "socket.io-client";
import Share from "../components/Share";

function DocEditor() {
  let params = useParams();
  const [user, setUser] = useOutletContext();
  const navigate = useNavigate();
  const [editorData, setEditorData] = useState({});
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [sharedList, setSharedList] = useState([]);
  const [createdBy, setCreatedBy] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();

  const titleRef = useRef();
  const isFirstRender = useRef(true);
  const fileAdded = useRef(false);

  useEffect(() => {
    const s = io("http://localhost:4000");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || params.id == null) return;
    socket.emit("join-doc", params.id);
  }, [socket, params.id]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const quillHandler = (delta) => {
      quill.updateContents(delta);
    };

    const titleHandler = (title) => {
      setTitle(title);
    };

    socket.on("recieve-quill-changes", quillHandler);
    socket.on("recieve-title-changes", titleHandler);

    return () => {
      socket.off("recieve-quill-changes", quillHandler);
      socket.off("recieve-title-changes", titleHandler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta, oldDelta, source) => {
      if (source === "api" && fileAdded.current) {
        socket.emit("send-quill-changes", delta);
        fileAdded.current = false;
        return;
      }
      if (source === "user") socket.emit("send-quill-changes", delta);
    };

    quill.on("text-change", handler);

    return () => quill.off("text-change", handler);
  }, [socket, quill]);

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
          setSharedList(data.doc.sharedList);
          setCreatedBy(data.doc.createdBy);
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

  useEffect(() => {
    const interval = setInterval(() => {
      handleSave();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  });

  function changeFileAdded(value) {
    fileAdded.current = value;
  }

  function handleTitle(e) {
    if (socket == null) return;
    socket.emit("send-title-changes", e.target.value);
    setTitle(e.target.value);
  }

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
      // .then((data) => console.log("save", data))
      .catch((e) => console.log(e));
  }

  function toggleShare() {
    setShowShare((prev) => !prev);
  }

  return (
    <div className="doceditor">
      {showShare && (
        <div className="doceditor_share">
          <Share
            title={title}
            sharedList={sharedList}
            setSharedList={setSharedList}
            id={params.id}
            toggleShare={toggleShare}
            creatorUserId={user.userId}
          />
        </div>
      )}
      <div className="doceditor_top">
        <div className="doceditor_title">
          <label htmlFor="title">Title</label>
          <input
            ref={titleRef}
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={handleTitle}
          />
        </div>
        {user._id === createdBy && (
          <>
            <button
              onClick={() => {
                setIsPublic((prev) => !prev);
              }}
            >
              Make {isPublic ? "Private" : "Public"}
            </button>
            <button onClick={toggleShare}>Share</button>
          </>
        )}
      </div>
      <TextEditor
        docId={params.id}
        setEditorData={setEditorData}
        editorData={editorData}
        setQuill={setQuill}
        changeFileAdded={changeFileAdded}
      />
    </div>
  );
}

export default DocEditor;
