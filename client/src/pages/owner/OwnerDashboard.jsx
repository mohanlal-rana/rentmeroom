import React from "react";
import { FaHome, FaUsers, FaBed, FaMoneyBill } from "react-icons/fa";

const stats = [
  {
    title: "Total Rooms",
    value: 0,
    icon: <FaHome />,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Total Bookings",
    value: 0,
    icon: <FaBed />,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Total Interested Users",
    value: 0,
    icon: <FaUsers />,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Total Earnings",
    value: "Rs 0",
    icon: <FaMoneyBill />,
    color: "bg-yellow-100 text-yellow-600",
  },
];

const OwnerDashboard = () => {
  return (
    <div className="min-h-screen bg-[#f6f4fa] p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#837ab6]">
          Owner Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome back 👋 Manage your rooms and track performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-2xl shadow-lg p-6 flex items-center justify-between ${stat.color}`}
          >
            <div>
              <p className="text-sm font-medium">{stat.title}</p>
              <h2 className="text-2xl font-bold mt-2">
                {stat.value}
              </h2>
            </div>

            <div className="text-3xl opacity-70">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Future Section */}
      <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-[#837ab6] mb-4">
          Quick Actions
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="bg-[#837ab6] text-white py-3 rounded-xl hover:bg-[#9d85b6] transition">
            ➕ Add New Room
          </button>

          <button className="bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition">
            📊 View Bookings
          </button>

          <button className="bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition">
            💰 View Earnings
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;