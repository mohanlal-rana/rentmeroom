import React from "react";
import { Outlet, NavLink } from "react-router-dom";

const OwnerLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <aside style={{ width: "220px", background: "#1e293b", color: "#fff", padding: "20px" }}>
        <h3>Owner Panel</h3>

        <nav style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <NavLink to="dashboard" style={{ color: "#fff" }}>Dashboard</NavLink>
          <NavLink to="rooms" style={{ color: "#fff" }}>My Rooms</NavLink>
          <NavLink to="rooms/add" style={{ color: "#fff" }}>Add Room</NavLink>
          <NavLink to="interested" style={{ color: "#fff" }}>Interested Users</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>

    </div>
  );
};

export default OwnerLayout;
