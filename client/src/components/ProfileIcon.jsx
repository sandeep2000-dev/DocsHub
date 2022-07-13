import "../css/profileicon.css";
import { useNavigate } from "react-router-dom";

function ProfileIcon(props) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/profile/${props.userId}`)}
      className="profileIcon"
    >
      <img src={`http://localhost:4000/${props.profileImagePath}`} />
      <p>{props.userId}</p>
    </div>
  );
}

export default ProfileIcon;
