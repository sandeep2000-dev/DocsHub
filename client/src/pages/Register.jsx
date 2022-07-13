import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../css/register.css";

function Register() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [mssg, setMssg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:4000/register", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "fail") navigate("/");
      })
      .catch((e) => console.log(e));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    const formData = {
      name: name,
      userId: userId,
      password: password,
    };

    fetch("http://localhost:4000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setMssg(data.mssg);
          setName("");
          setUserId("");
          setPassword("");
        } else if (data.status === "fail") {
          setMssg(data.mssg);
        } else if (data.status === "error") throw new Error(data.err);
      })
      .catch((e) => {
        console.log("Error: ", e);
      });
  }

  return (
    <div className="register">
      <div className="register_container">
        <form onSubmit={handleSubmit} method="POST">
          <div className="register_field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              placeholder="Enter Name"
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="register_field">
            <label htmlFor="userId">UserId</label>
            <input
              type="email"
              id="userId"
              value={userId}
              placeholder="Enter UserId"
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="register_field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="register_field">
            <button type="submit">Register</button>
            <Link to="/login">Login</Link>
          </div>
        </form>
        {mssg === "" || (
          <div className="register_mssg">
            <p>{mssg}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
