import { useEffect, useState } from "react";
import DocCard from "../components/DocCard";
import { useNavigate, useOutletContext } from "react-router-dom";
import "../css/mydocs.css";

function MyDocs() {
  const [docs, setDocs] = useState([]);
  const [title, setTitle] = useState("");
  const [user, setUser] = useOutletContext();

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/doc", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setDocs(data.data);
        else if (data.status === "error") throw new Error(data.err);
      })
      .catch((e) => console.log("we got error", e));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    const formData = {
      title: title,
    };

    fetch("/api/doc/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status);
      })
      .then((data) => {
        navigate(`/doc/${data.data._id}/edit`);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  function handleDocDelete(id) {
    fetch(`/api/doc/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status);
      })
      .then((data) => {
        if (data.status === "success") {
          const newDocs = docs.filter((doc) => {
            return doc._id !== id;
          });
          const newBookmarks = user.bookmarks.filter((d) => d._id !== id);
          setDocs(newDocs);
          setUser((prev) => ({ ...prev, bookmarks: newBookmarks }));
        } else console.log(data.err);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  return (
    <div className="mydocs">
      <div className="mydocs_createDoc">
        <p>Create new Doc</p>
        <form onSubmit={handleSubmit} method="POST">
          <div className="mydocs_title">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <button>Create</button>
          </div>
        </form>
      </div>
      <div className="mydocs_docs">
        <p>My Documents</p>
        <div className="mydocs_list">
          {docs.map((doc) => (
            <DocCard
              key={doc._id}
              {...doc}
              onlyView={false}
              onDelete={handleDocDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyDocs;
