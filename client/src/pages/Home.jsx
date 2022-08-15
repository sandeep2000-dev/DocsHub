import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/home.css";

function Home() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setUser(data.data);
        else if (data.status === "fail") navigate("/login");
        else if (data.status === "error") throw new Error(data.err);
      })
      .catch((e) => console.log(e));
  }, []);

  function handleLogout() {
    fetch("/api/logout", {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        navigate("/login");
      })
      .catch((e) => console.log(e));
  }

  return (
    <div className="home">
      <Navbar handleLogout={handleLogout} userId={user.userId} />
      <Outlet context={[user, setUser]} />
    </div>
  );
}

export default Home;
