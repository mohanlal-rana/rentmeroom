import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../store/AuthContext";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { storeTokenInLS } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (data.token) {
        storeTokenInLS(data.token);
      }

      alert("Login successful!");
      setFormData({ email: "", password: "" });
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      alert("Server error. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #837ab6, #f6a5c0)" }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2
          className="text-3xl font-bold text-center mb-6"
          style={{ color: "#837ab6" }}
        >
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: "#9d85b6", caretColor: "#837ab6" }}
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10"
              style={{ borderColor: "#cc8db3", caretColor: "#837ab6" }}
              placeholder="Enter your password"
            />
            <span
              className="absolute top-9 right-3 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 font-semibold rounded-lg transition duration-300 text-white"
            style={{
              background: "linear-gradient(135deg, #9d85b6, #cc8db3)",
            }}
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm mt-6 text-gray-500">
          Don't have an account?{" "}
          <span
            className="font-medium cursor-pointer hover:underline"
            style={{ color: "#837ab6" }}
          >
            <Link to="/signup">SIGN UP</Link>
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
