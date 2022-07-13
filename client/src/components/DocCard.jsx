import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "../css/doccard.css";
import { MdDelete, MdModeEdit } from "react-icons/md";

function DocCard(props) {
  const navigate = useNavigate();
  return (
    <div className="doccard">
      <div onClick={() => navigate(`/doc/${props._id}/view`)}>
        <div className="doccard_content">
          <ReactQuill readOnly={true} theme="bubble" value={props.data || ""} />
        </div>
        <div className="doccard_info">
          <p className="doccard_title">{props.title}</p>
        </div>
      </div>
      <div className="doccard_footer">
        <div onClick={() => navigate(`/doc/${props._id}/view`)}>
          <div className="doccard_date">
            <p>createdAt: {props.createdAt}</p>
            <p>updatedAt: {props.updatedAt}</p>
          </div>
          {!props.onlyView || (
            <p className="doccard_likes">Likes: {props.likedBy.length}</p>
          )}
        </div>
        {props.onlyView || (
          <div className="doccard_btn">
            <div
              className="doccard_item"
              onClick={() => navigate(`/doc/${props._id}/edit`)}
            >
              <MdModeEdit className="doccard_edit_icon" />
            </div>
            <div
              className="doccard_item"
              onClick={() => props.onDelete(props._id)}
            >
              <MdDelete className="doccard_delete_icon" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocCard;
