import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext.jsx";

import {
  FaHome,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaSyncAlt,
} from "react-icons/fa";

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { API } = useAuth();

  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalRooms: 0,
    verifiedRooms: 0,
    pendingRooms: 0,
    totalInterested: 0,
  });

  /* ================= FETCH DASHBOARD DATA ================= */

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const roomsRes = await fetch(
        `${API}/api/rooms/owner/rooms`,
        { credentials: "include" }
      );

      const interestsRes = await fetch(
        `${API}/api/interested/owner/interests`,
        { credentials: "include" }
      );

      const roomsData = await roomsRes.json();
      const interestsData = await interestsRes.json();

      const rooms = roomsData.rooms || [];
      const interests = interestsData.interests || [];

      const verified = rooms.filter(r => r.isVerified).length;
      const pending = rooms.filter(r => !r.isVerified).length;

      setStats({
        totalRooms: rooms.length,
        verifiedRooms: verified,
        pendingRooms: pending,
        totalInterested: interests.length,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#f6f4fa] p-8">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#837ab6]">
            Owner Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back 👋 Manage your rooms and track performance.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow hover:bg-[#ece9f7] transition"
        >
          <FaSyncAlt className="text-[#837ab6]" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="text-center text-gray-500">
          Loading dashboard...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          <StatCard
            title="Total Rooms"
            value={stats.totalRooms}
            icon={<FaHome size={22} />}
          />

          <StatCard
            title="Verified Rooms"
            value={stats.verifiedRooms}
            icon={<FaCheckCircle size={22} />}
          />

          <StatCard
            title="Pending Verification"
            value={stats.pendingRooms}
            icon={<FaClock size={22} />}
          />

          <StatCard
            title="Interested Users"
            value={stats.totalInterested}
            icon={<FaUsers size={22} />}
          />

        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-[#837ab6] mb-6">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">

          <button
            onClick={() => navigate("/owner/rooms")}
            className="px-6 py-3 bg-[#837ab6] text-white rounded-xl hover:bg-[#9d85b6] transition"
          >
            🏠 Manage Rooms
          </button>

          <button
            onClick={() => navigate("/owner/rooms/add")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            ➕ Add New Room
          </button>

          <button
            onClick={() => navigate("/owner/interested")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            👥 Interested Users
          </button>

        </div>
      </div>

      {/* Info */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-[#837ab6] mb-4">
          Performance Overview
        </h2>

        <p className="text-gray-600 text-sm leading-relaxed">
          Monitor your rooms, track verification status, and see how many users
          are interested in your listings. Keeping rooms updated improves
          visibility and increases tenant engagement.
        </p>
      </div>

    </div>
  );
};

/* ================= STAT CARD ================= */

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:scale-105 transition-transform duration-200">
      
      <div className="flex items-center justify-between">
        <h3 className="text-gray-500 text-sm font-medium">
          {title}
        </h3>

        <div className="text-[#837ab6]">
          {icon}
        </div>
      </div>

      <p className="text-3xl font-bold text-[#837ab6] mt-3">
        {value}
      </p>

    </div>
  );
};

export default OwnerDashboard;