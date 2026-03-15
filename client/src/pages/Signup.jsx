import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    try {
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const mapErr = {};

          data.errors.forEach((err) => {
            mapErr[err.field] = err.message;
          });

          setFieldErrors(mapErr);
          throw new Error("Please correct the errors below");
        }

        throw new Error(data.message || "Signup failed");
      }

      navigate("/verifyotp", { state: { email: formData.email } });
    } catch (err) {
      setError(err.message);
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
          Create Your Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={fieldErrors.name}
          />

          {/* Email */}
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
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
            />

            <span
              className="absolute top-9 right-3 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
            />

            <span
              className="absolute top-9 right-3 cursor-pointer text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2 font-semibold rounded-lg text-white"
            style={{
              background: "linear-gradient(135deg, #9d85b6, #cc8db3)",
            }}
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: "#837ab6" }}
          >
            LOGIN
          </Link>
        </p>
      </div>
    </div>
  );
}

/* Input Component (same pattern as AddRoom) */

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

export default Signup;
