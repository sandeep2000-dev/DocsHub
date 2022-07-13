import { useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../css/profile.css";
import ViewProfile from "../components/ViewProfile";
import EditProfile from "../components/EditProfile";
import DocCard from "../components/DocCard";

function Profile() {
  const [user, setUser] = useOutletContext();
  const [edit, setEdit] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  let params = useParams();

  useEffect(() => {
    fetch(`http://localhost:4000/user/${params.userId}`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        else throw new Error(res.status);
      })
      .then((data) => {
        if (data.status === "success") {
          setUserProfile(data.userProfile);
        } else if (data.status === "fail") console.log(data.mssg);
        else if (data.status === "error") throw new Error(data.err);
      })
      .catch((e) => console.log(e));
  }, [params.userId]);

  function toggleEdit() {
    setEdit((prev) => !prev);
  }

  return (
    <div className="profile">
      <div className="profile_details">
        {edit || (
          <ViewProfile
            user={user.userId === userProfile.userId ? user : userProfile}
            isEditable={user.userId === userProfile.userId}
            toggleEdit={toggleEdit}
          />
        )}
        {edit && (
          <EditProfile
            user={user.userId === userProfile.userId ? user : userProfile}
            setUser={setUser}
            toggleEdit={toggleEdit}
          />
        )}
      </div>
      <div className="profile_likedDocs">
        <p>Liked Documents</p>
        <div className="profile_docList">
          {userProfile.likedDocs == null ||
          userProfile.likedDocs.length === 0 ? (
            <h1>No Liked Documents</h1>
          ) : (
            userProfile.likedDocs.map((doc) => (
              <DocCard key={doc._id} {...doc} onlyView={true} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
