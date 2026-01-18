import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { isLoggedIn, logoutUser } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-xl font-bold text-[#837ab6] cursor-pointer" onClick={() => navigate("/")}>RoomRent</h1>

      {/* Navigation */}
      <nav className="flex items-center gap-6">
        <Link
          to="/"
          className="font-medium text-gray-600 hover:text-[#9d85b6] transition"
        >
          Home
        </Link>
        {isLoggedIn && (
          <Link
            to="/interested"
            className="font-medium text-gray-600 hover:text-[#9d85b6] transition"
          >
            Interested
          </Link>
        )}

        {!isLoggedIn ? (
          <>
            <Link
              to="/signup"
              className="font-medium text-gray-600 hover:text-[#9d85b6] transition"
            >
              Signup
            </Link>

            <Link
              to="/login"
              className="font-medium text-gray-600 hover:text-[#9d85b6] transition"
            >
              Login
            </Link>
          </>
        ) : (
          <button
            onClick={logoutUser}
            className="px-4 py-1.5 rounded-md font-semibold bg-[#cc8db3] hover:bg-[#9d85b6] text-white transition"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
