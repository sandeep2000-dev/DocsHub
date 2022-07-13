import { useOutletContext } from "react-router-dom";
import DocCard from "../components/DocCard";
import "../css/bookmarks.css";

function Bookmarks() {
  const [user, setUser] = useOutletContext();
  return (
    <div className="bookmarks">
      <p>Bookmarked Documents</p>
      <div className="bookmarks_list">
        {user.bookmarks == null || user.bookmarks.length === 0 ? (
          <h1>No Liked Documents</h1>
        ) : (
          user.bookmarks.map((doc) => (
            <DocCard key={doc._id} {...doc} onlyView={true} />
          ))
        )}
      </div>
    </div>
  );
}

export default Bookmarks;
