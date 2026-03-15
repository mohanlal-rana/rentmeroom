import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../store/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { API, loginUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle field errors if returned from API
        if (data.errors) {
          const mapErr = {};
          data.errors.forEach((err) => {
            mapErr[err.field] = err.message;
          });
          setFieldErrors(mapErr);
          return;
        }

        setError(data.message || "Login failed");
        return;
      }

      if (!data.user.isActive) {
        setError("Your account is blocked. Contact admin.");
        return;
      }

      loginUser(data.user);
      setFormData({ email: "", password: "" });
      navigate("/"); // redirect to home
    } catch (err) {
      setError("Server error. Please try again.",err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      // style={{ background: "linear-gradient(135deg, #837ab6, #f6a5c0)" }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2
          className="text-3xl font-bold text-center mb-6"
          style={{ color: "#837ab6" }}
        >
          Login to Your Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="Enter your email"
          />

          {/* Password */}
          <div className="relative">
            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
              placeholder="Enter your password"
            />

            <span
              className="absolute top-9 right-3 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2 font-semibold rounded-lg text-white"
            style={{
              background: "linear-gradient(135deg, #9d85b6, #cc8db3)",
            }}
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium hover:underline"
            style={{ color: "#837ab6" }}
          >
            SIGN UP
          </Link>
        </p>
      </div>
    </div>
  );
}

const Input = ({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>

    <input
      {...props}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    />

    {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
  </div>
);

export default Login;