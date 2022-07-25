import { useState } from "react";
import "../css/share.css";

function User(props) {
  return (
    <div className="share_user">
      <p>{props.userId}</p>
      {props.isCreator ? (
        <p style={{ textAlign: "center" }}>Owner</p>
      ) : (
        <button onClick={() => props.onDelete(props.userId)}>Remove</button>
      )}
    </div>
  );
}

function Share(props) {
  const [userId, setUserId] = useState("");
  const [mssg, setMssg] = useState("");

  function handleSharedListDelete(userId) {
    props.setSharedList((prev) => {
      return prev.filter((uId) => uId !== userId);
    });
  }

  function handleSharedListAdd() {
    if (userId === "" || props.sharedList.includes(userId)) return;
    props.setSharedList((prev) => [...prev, userId]);
    setUserId("");
  }

  function handleDone() {
    fetch(`http://localhost:4000/doc/${props.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sharedList: props.sharedList,
      }),
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status);
      })
      .then((data) => {
        if (data.status === "fail") {
          setMssg(data.mssg);
        } else {
          props.toggleShare();
        }
      })
      .catch((e) => console.log(e));
  }

  return (
    <div className="share">
      <p className="share_title">Share {props.title}</p>
      <input
        className="share_input"
        type="text"
        placeholder="Add user"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button className="share_btn" onClick={handleSharedListAdd}>
        Add
      </button>
      <div className="share_access">
        <p>People with access</p>
        <div className="share_list">
          {props.sharedList.map((userId) => (
            <User
              key={userId}
              userId={userId}
              onDelete={handleSharedListDelete}
              isCreator={props.creatorUserId === userId}
            />
          ))}
        </div>
      </div>
      <button className="share_btn" onClick={handleDone}>
        Done
      </button>
      {mssg !== "" && <p>{mssg}</p>}
    </div>
  );
}

export default Share;
