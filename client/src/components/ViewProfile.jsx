import "../css/viewprofile.css";

function ViewProfile(props) {
  return (
    <div className="viewProfile">
      {props.user.profileImagePath && (
        <div className="viewProfile_image">
          <img src={`http://localhost:4000/${props.user.profileImagePath}`} />
        </div>
      )}
      <div className="viewProfile_field">
        <p>Name:</p>
        <p>{props.user.name}</p>
      </div>
      <div className="viewProfile_field">
        <p>UserId:</p>
        <p>{props.user.userId}</p>
      </div>
      {props.isEditable && <button onClick={props.toggleEdit}>Edit</button>}
    </div>
  );
}

export default ViewProfile;
