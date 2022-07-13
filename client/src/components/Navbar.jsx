import { NavLink } from "react-router-dom";
import "../css/navbar.css";

function Navbar(props) {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink
            className={(navData) => (navData.isActive ? "navbar_active" : "")}
            to="/"
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            className={(navData) => (navData.isActive ? "navbar_active" : "")}
            to="/search"
          >
            Search
          </NavLink>
        </li>
        <li>
          <NavLink
            className={(navData) => (navData.isActive ? "navbar_active" : "")}
            to="/bookmarks"
          >
            Bookmarks
          </NavLink>
        </li>
        <li>
          <NavLink
            className={(navData) => (navData.isActive ? "navbar_active" : "")}
            to={`/profile/${props.userId}`}
          >
            Profile
          </NavLink>
        </li>
        <li style={{ float: "right" }}>
          <button onClick={props.handleLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
