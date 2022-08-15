import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "../css/viewdoc.css";
import ProfileIcon from "../components/ProfileIcon";
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import { BsBookmarks, BsBookmarksFill } from "react-icons/bs";

function ViewDoc() {
  let params = useParams();
  const navigate = useNavigate();
  const quillRef = useRef();
  const [doc, setDoc] = useState({});
  const [user, setUser] = useOutletContext();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetch(`/api/doc/${params.id}/view`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status);
      })
      .then((data) => {
        if (data.status === "success") {
          quillRef.current.getEditor().setContents(data.doc.data);
          setDoc(data.doc);
        } else if (data.status === "fail") {
          console.log(data.mssg);
          navigate("/");
        } else throw new Error(data.err);
      })
      .catch((e) => console.log(e));
  }, []);

  useEffect(() => {
    if (doc.likedBy) setIsLiked(doc.likedBy.includes(user._id));
  }, [doc, user]);

  useEffect(() => {
    if (user.bookmarks) {
      setIsBookmarked(user.bookmarks.some((d) => d._id === params.id));
    }
  }, [user]);

  function handleLike() {
    fetch(`/api/doc/${doc._id}/feedback`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        likedBy: user._id,
      }),
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error(res.status);
      })
      .then((data) => {
        if (data.status === "success") {
          setDoc((prev) => {
            return { ...prev, likedBy: data.likedBy, comments: data.comments };
          });
        } else if (data.status === "error") throw new Error(data.err);
      })
      .catch((e) => console.log(e));
  }

  function handleBookmark() {
    fetch(`/api/user/${user._id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        bookmark: doc._id,
      }),
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error(res.status);
      })
      .then((data) => {
        if (data.status === "success") {
          let bookmarks;
          if (data.bookmarks.includes(doc._id)) {
            bookmarks = [...user.bookmarks, doc];
          } else {
            bookmarks = user.bookmarks.filter((d) => d._id !== doc._id);
          }
          setUser((prev) => {
            return { ...prev, bookmarks: bookmarks };
          });
        } else if (data.status === "error") throw new Error(data.err);
      })
      .catch((e) => console.log(e));
  }

  return (
    <div className="viewdoc">
      <div className="viewdoc_top">
        {doc.isPublic && (
          <div className="viewdoc_info">
            <div className="viewdoc_info_bookmark">
              {isBookmarked ? (
                <BsBookmarksFill
                  className="viewdoc_bookmark_icon"
                  onClick={handleBookmark}
                />
              ) : (
                <BsBookmarks
                  className="viewdoc_bookmark_icon"
                  onClick={handleBookmark}
                />
              )}
            </div>
            <div className="viewdoc_info_like">
              {isLiked ? (
                <AiFillLike
                  className="viewdoc_like_icon"
                  onClick={handleLike}
                />
              ) : (
                <AiOutlineLike
                  className="viewdoc_like_icon"
                  onClick={handleLike}
                />
              )}
              <p>{doc.likedBy.length}</p>
            </div>
            <ProfileIcon
              userId={doc.createdBy.userId}
              profileImagePath={doc.createdBy.profileImagePath}
            />
          </div>
        )}
        <p className="viewdoc_title">{doc.title}</p>
      </div>
      <ReactQuill readOnly={true} theme="bubble" ref={quillRef} />
    </div>
  );
}

export default ViewDoc;
