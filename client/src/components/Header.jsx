import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { FiMenu, FiX } from "react-icons/fi"; // icons for hamburger

export default function Header() {
  const { isLoggedIn, logoutUser, user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = user?.role; // "owner" | "admin" | "user"

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="bg-white shadow-md px-6 py-3">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <h1
          className="text-xl font-bold text-[#837ab6] cursor-pointer"
          onClick={() => navigate("/")}
        >
          RoomRent
        </h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="font-medium text-gray-600 hover:text-[#9d85b6] transition"
          >
            Home
          </Link>

          {isLoggedIn && role === "owner" && (
            <>
              <Link
                to="/owner/dashboard"
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                Dashboard
              </Link>
              <Link
                to="/owner/rooms"
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                My Rooms
              </Link>
            </>
          )}

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
                Saved Rooms
              </Link>
              {role === "user" && (
                <Link
                  to="/owner-form"
                  className="font-medium text-gray-600 hover:text-[#9d85b6]"
                >
                  Be Owner
                </Link>
              )}
              <Link
                to="/myprofile"
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                My Profile
              </Link>
              <button
                onClick={() => logoutUser(navigate)}
                className="px-4 py-1.5 rounded-md font-semibold bg-[#cc8db3] hover:bg-[#9d85b6] text-white transition"
              >
                Logout
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-gray-700"
          onClick={toggleMenu}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-3 bg-white p-4 rounded-xl shadow">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="font-medium text-gray-600 hover:text-[#9d85b6]"
          >
            Home
          </Link>

          {isLoggedIn && role === "owner" && (
            <>
              <Link
                to="/owner/dashboard"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                Dashboard
              </Link>
              <Link
                to="/owner/rooms"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                My Rooms
              </Link>
            </>
          )}

          {isLoggedIn && role === "admin" && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                Manage Users
              </Link>
            </>
          )}

          {!isLoggedIn ? (
            <>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                Signup
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                Login
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/interested"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                Interested
              </Link>
              <Link
                to="/saved-rooms"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                Saved Rooms
              </Link>
              {role === "user" && (
                <Link
                  to="/owner-form"
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-gray-600 hover:text-[#9d85b6]"
                >
                  Be Owner
                </Link>
              )}
              <Link
                to="/myprofile"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-600 hover:text-[#9d85b6]"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  logoutUser(navigate);
                  setMenuOpen(false);
                }}
                className="px-4 py-1.5 rounded-md font-semibold bg-[#cc8db3] hover:bg-[#9d85b6] text-white transition mt-2"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}