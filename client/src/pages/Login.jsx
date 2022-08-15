import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMssg, setErrorMssg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/login", {
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
      userId: userId,
      password: password,
    };

    fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error(res.status);
      })
      .then((data) => {
        if (data.status === "success") {
          navigate("/");
        }
      })
      .catch((e) => {
        console.log(e);
        setErrorMssg("Wrong userId or password");
      });
  }

  return (
    <div className="login">
      <div className="login_container">
        <form onSubmit={handleSubmit} method="POST">
          <div className="login_field">
            <label htmlFor="userId">UserId</label>
            <br />
            <input
              type="email"
              id="userId"
              value={userId}
              placeholder="Enter UserId"
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div className="login_field">
            <label htmlFor="password">Password</label>
            <br />
            <input
              type="password"
              id="password"
              value={password}
              placeholder="Enter Password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="login_field">
            <button type="submit">Login</button>
            <Link to="/register">Register</Link>
          </div>
        </form>
        {errorMssg === "" || (
          <div className="login_error">
            <p>{errorMssg}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
