import React, { useState } from "react";

function VerifyOtp() {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    console.log("Entered OTP:", otp);
    alert("OTP Verified Successfully!");
    setOtp("");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #837ab6, #f6a5c0)",
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <h2
          className="text-2xl font-bold text-center mb-3"
          style={{ color: "#837ab6" }}
        >
          Verify OTP
        </h2>

        <p className="text-center text-sm mb-6" style={{ color: "#9d85b6" }}>
          Enter the 6-digit code sent to your email
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OTP Code
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 text-center tracking-widest text-lg border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: "#cc8db3",
                caretColor: "#837ab6",
              }}
              required
            />
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            className="w-full py-2 text-white font-semibold rounded-lg transition duration-300"
            style={{
              background: "linear-gradient(135deg, #9d85b6, #cc8db3)",
            }}
          >
            Verify OTP
          </button>
        </form>

        {/* Resend */}
        <p className="text-center text-sm mt-5 text-gray-500">
          Didn’t receive the code?{" "}
          <span
            className="font-medium cursor-pointer hover:underline"
            style={{ color: "#837ab6" }}
          >
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;
