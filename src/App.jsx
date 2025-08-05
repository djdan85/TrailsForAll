import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import AddTrail from "./pages/AddTrail";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";

export default function App() {
  return (
    <div>
      <nav>
        <h1>TrailsForAll</h1>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/add">Add Trail</Link></li>
          <li><Link to="/admin">Admin</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddTrail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}
