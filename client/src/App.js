import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { Route, Routes, useParams } from "react-router-dom";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import MyDocs from "./pages/MyDocs";
import DocEditor from "./pages/DocEditor";
import ViewDoc from "./pages/ViewDoc";
import "./css/app.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />}>
          <Route path="/" element={<MyDocs />} />
          <Route path="/search" element={<Search />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/doc/:id/edit" element={<DocEditor />} />
          <Route path="/doc/:id/view" element={<ViewDoc />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
