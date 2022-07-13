import { useState, useEffect } from "react";
import DocCard from "../components/DocCard";
import "../css/search.css";

function Search() {
  const [docList, setDocList] = useState([]);
  const [title, setTitle] = useState("");
  const [userId, setUserId] = useState("");
  const [Tags, setTags] = useState([]);

  useEffect(() => {
    const params = {
      title: title,
      userId: userId,
    };
    fetch("http://localhost:4000/doc/search?" + new URLSearchParams(params), {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setDocList(data.docList);
        else if (data.status === "error") throw new Error(data.err);
      })
      .catch((e) => console.log("we got error", e));
  }, [title, userId]);

  return (
    <div className="search">
      <p>Search</p>
      <div className="search_types">
        <div className="search_title">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            value={title}
            id="title"
            placeholder="all"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="search_user">
          <label htmlFor="userId">UserId</label>
          <input
            type="text"
            value={userId}
            id="userId"
            placeholder="all"
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        {/* implement tags */}
      </div>
      <div className="search_list">
        {docList.map((doc) => (
          <DocCard key={doc._id} {...doc} onlyView={true} />
        ))}
      </div>
    </div>
  );
}

export default Search;
