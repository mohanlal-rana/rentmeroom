import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext.jsx";

export default function OwnerForm() {
  const navigate = useNavigate();
  const { API } = useAuth();

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    govIDType: "",
    govIDNumber: "",
    facebook: "",
    whatsapp: "",
    bio: "",
  });

  const [govIDImage, setGovIDImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------- Handlers ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[name];
        return newErr;
      });
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "govIDImage") setGovIDImage(file);
    if (type === "profileImage") setProfileImage(file);

    // Clear error for the file input
    if (fieldErrors[type]) {
      setFieldErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[type];
        return newErr;
      });
    }
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const data = new FormData();
      // Append text fields
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));

      // Append files
      if (govIDImage) data.append("govIDImage", govIDImage);
      if (profileImage) data.append("profileImage", profileImage);

      const res = await fetch(`${API}/api/users/upgrade-to-owner`, {
        method: "PUT",
        credentials: "include", // Important for authenticateUser middleware
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        // Handle Zod validation errors from your backend middleware
        if (result.errors) {
          const mapErr = {};
          result.errors.forEach((err) => {
            mapErr[err.field] = err.message;
          });
          setFieldErrors(mapErr);
          throw new Error("Validation Failed");
        }

        throw new Error(result.message || "Something went wrong");
      }

      alert("Success! You are now an Owner.");
      navigate("/owner/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f4fa] py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-[#837ab6] mb-6 text-center">
          Become an Owner
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-6 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
            />
            <Input
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={fieldErrors.address}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Gov ID Type"
              name="govIDType"
              value={formData.govIDType}
              onChange={handleChange}
              options={["Citizenship", "Passport", "Driving License"]}
              error={fieldErrors.govIDType}
            />
            <Input
              label="Gov ID Number"
              name="govIDNumber"
              value={formData.govIDNumber}
              onChange={handleChange}
              error={fieldErrors.govIDNumber}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FileInput
              label="Gov ID Image"
              onChange={(e) => handleFileChange(e, "govIDImage")}
              error={fieldErrors.govIDImage}
              file={govIDImage}
            />
            <FileInput
              label="Profile Image"
              onChange={(e) => handleFileChange(e, "profileImage")}
              error={fieldErrors.profileImage}
              file={profileImage}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Facebook URL"
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              error={fieldErrors.facebook}
            />
            <Input
              label="WhatsApp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              error={fieldErrors.whatsapp}
            />
          </div>

          <Textarea
            label="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            error={fieldErrors.bio}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-semibold rounded-lg text-white bg-[#837ab6] hover:bg-[#7369a3] transition disabled:bg-gray-400"
          >
            {loading ? "Upgrading..." : "Upgrade to Owner"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ----- UI Components ----- */

const Input = ({ label, error, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none transition ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Textarea = ({ label, error, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <textarea
      {...props}
      rows="3"
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none transition ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options, error, ...props }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <select
      {...props}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#837ab6] outline-none bg-white transition ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    >
      <option value="">Select {label}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const FileInput = ({ label, onChange, error, file }) => (
  <div className="w-full">
    <label className="block text-sm font-semibold text-gray-600 mb-1">
      {label}
    </label>
    <div
      className={`border-2 border-dashed rounded-lg p-2 text-center transition ${
        error ? "border-red-500 bg-red-50" : "border-gray-300"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#837ab6] file:text-white"
      />
      {file && (
        <p className="mt-1 text-[10px] text-green-600 truncate">{file.name}</p>
      )}
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
