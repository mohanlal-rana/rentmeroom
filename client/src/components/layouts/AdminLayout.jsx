import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../store/AuthContext.jsx"; // adjust
function AdminLayout() {
  const { user, isLoggedIn, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        navigate("/login"); // not logged in
      } else if (user.role !== "admin") {
        navigate("/"); // logged in but not admin
      }
    }
  }, [isLoading, isLoggedIn, user, navigate]);

  if (isLoading) {
    return <div className="text-center mt-10 text-[#837ab6]">Loading...</div>;
  }

  // Once past the checks, render the admin layout
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
          <NavLink to="/" style={{ color: "#fff" }}>
            Home
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
