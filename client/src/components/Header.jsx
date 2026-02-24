import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function Header() {
  const { isLoggedIn, logoutUser, user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role; // "owner" | "admin" | "user"

  return (
    <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <h1
        className="text-xl font-bold text-[#837ab6] cursor-pointer"
        onClick={() => navigate("/")}
      >
        RoomRent
      </h1>

      {/* Navigation */}
      <nav className="flex items-center gap-6">
        {/* Always Visible */}
        <Link
          to="/"
          className="font-medium text-gray-600 hover:text-[#9d85b6] transition"
        >
          Home
        </Link>

        {/* ✅ OWNER LINKS */}
        {isLoggedIn && role === "owner" && (
          <>
            <Link
              to="/owner/dashboard"
              className="font-medium text-gray-600 hover:text-[#9d85b6]"
            >
              Dashboard
            </Link>

            {/* <Link
              to="/interested"
              className="font-medium text-gray-600 hover:text-[#9d85b6]"
            >
              Interested
            </Link> */}

            <Link
              to="/owner/rooms"
              className="font-medium text-gray-600 hover:text-[#9d85b6]"
            >
              My Rooms
            </Link>
          </>
        )}

        {/* ✅ ADMIN LINKS */}
        {isLoggedIn && role === "admin" && (
          <>
            <Link
              to="/admin/dashboard"
              className="font-medium text-gray-600 hover:text-[#9d85b6]"
            >
              Admin Dashboard
            </Link>

            <Link
              to="/admin/users"
              className="font-medium text-gray-600 hover:text-[#9d85b6]"
            >
              Manage Users
            </Link>
          </>
        )}

        {/* ✅ AUTH LINKS */}
        {!isLoggedIn ? (
          <>
            <Link
              to="/signup"
              className="font-medium text-gray-600 hover:text-[#9d85b6]"
            >
              Signup
            </Link>

            <Link
              to="/login"
              className="font-medium text-gray-600 hover:text-[#9d85b6]"
            >
              Login
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/interested"
              className="font-medium text-gray-600 hover:text-[#9d85b6]"
            >
              Interested
            </Link>
            <Link
              to="/saved-rooms"
              className="font-medium text-gray-600 hover:text-[#9d85b6]"
            >
              Saved-Rooms
            </Link>
            <button
              onClick={logoutUser}
              className="px-4 py-1.5 rounded-md font-semibold bg-[#cc8db3] hover:bg-[#9d85b6] text-white transition"
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
