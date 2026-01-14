import { NavLink, Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: "230px",
          background: "#111827",
          color: "#fff",
          padding: "20px",
        }}
      >
        <h2>Admin</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <NavLink to="dashboard" style={{ color: "#fff" }}>
            Dashboard
          </NavLink>
          <NavLink to="users" style={{ color: "#fff" }}>
            Users
          </NavLink>
          <NavLink to="rooms" style={{ color: "#fff" }}>
            Rooms
          </NavLink>
        </nav>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;
