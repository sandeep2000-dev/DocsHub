import { useEffect, useRef, useState } from "react";
import "../css/editprofile.css";

function EditProfile(props) {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const profileImageRef = useRef();

  useEffect(() => {
    setName(props.user.name || "");
    setUserId(props.user.userId || "");
  }, [props.user]);

  function handleSubmit(e) {
    e.preventDefault();
    const file = profileImageRef.current.files[0];
    let formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("userId", userId);
    fetch(`/api/user/${props.user._id}/`, {
      method: "PATCH",
      body: formData,
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        else return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          props.setUser((prev) => {
            return {
              ...prev,
              name: data.name,
              userId: data.userId,
              profileImagePath: data.profileImagePath,
            };
          });
          props.toggleEdit();
        } else if (data.status === "error") throw new Error(data.err);
      })
      .catch((e) => console.log(e));
  }

  return (
    <form method="POST" onSubmit={handleSubmit} className="editProfile">
      <div className="editProfile_field">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="editProfile_field">
        <label htmlFor="userId">UserId</label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>
      <div className="editProfile_file">
        <p>Change Profile picture</p>
        <input type="file" accept="image/*" ref={profileImageRef} />
      </div>
      <button type="submit" className="editProfile_saveBtn">
        Save
      </button>
      <button
        type="button"
        onClick={props.toggleEdit}
        className="editProfile_cancleBtn"
      >
        Cancle
      </button>
    </form>
  );
}

export default EditProfile;
