import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";

export default function Header() {
  const { isLogedIn, LogoutUser } = useAuth();

  return (
    <header className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-xl font-bold text-gray-800">
        MyApp
      </h1>

      {/* Navigation */}
      <nav className="flex items-center gap-6">
        <Link
          to="/"
          className="text-gray-700 hover:text-indigo-600 font-medium"
        >
          Home
        </Link>

        {!isLogedIn ? (
          <>
            <Link
              to="/signup"
              className="text-gray-700 hover:text-indigo-600 font-medium"
            >
              Signup
            </Link>

            <Link
              to="/login"
              className="text-gray-700 hover:text-indigo-600 font-medium"
            >
              Login
            </Link>
          </>
        ) : (
          <button
            onClick={LogoutUser}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md transition"
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  );
}
