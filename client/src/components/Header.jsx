import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div style={{ backgroundColor: "#f0f0f0", padding: "10px" }}>
      <Link style={{ marginRight: "20px" }} to="/">home</Link>
      <Link to="/signup">signup</Link>
    </div>
  );
}
