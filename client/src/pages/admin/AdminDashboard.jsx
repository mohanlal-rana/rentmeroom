import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext.jsx";
import {
  HiUsers,
  HiHome,
  HiOfficeBuilding,
  HiRefresh,
} from "react-icons/hi";

function AdminDashboard() {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalRooms: 0,
    totalActiveUsers: 0,
    pendingOwners: 0,
    verifiedRooms: 0,
    pendingRooms: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/api/admin/stats`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok)
        throw new Error(data.message || "Failed to fetch stats");

      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[#837ab6] text-lg">
        Loading Admin Dashboard...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500 gap-4">
        <p>{error}</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-[#837ab6] text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f6f4fa] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#837ab6]">
          Admin Dashboard
        </h1>

        <button
          onClick={fetchStats}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow hover:bg-[#ece9f7] transition"
        >
          <HiRefresh className="text-[#837ab6]" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} icon={<HiUsers size={22} />} />
        <StatCard title="Total Owners" value={stats.totalOwners} icon={<HiOfficeBuilding size={22} />} />
        <StatCard title="Pending Owners" value={stats.pendingOwners} icon={<HiOfficeBuilding size={22} />} />
        <StatCard title="Total Rooms" value={stats.totalRooms} icon={<HiHome size={22} />} />
        <StatCard title="Verified Rooms" value={stats.verifiedRooms} icon={<HiHome size={22} />} />
        <StatCard title="Pending Rooms" value={stats.pendingRooms} icon={<HiHome size={22} />} />
        <StatCard title="Active Users" value={stats.totalActiveUsers} icon={<HiUsers size={22} />} />
      </div>

      {/* Quick Actions */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-[#837ab6] mb-6">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="px-6 py-3 bg-[#837ab6] text-white rounded-xl hover:bg-[#9d85b6] transition"
          >
            Manage Users
          </button>

          <button
            onClick={() => navigate("/admin/rooms")}
            className="px-6 py-3 bg-[#837ab6] text-white rounded-xl hover:bg-[#9d85b6] transition"
          >
            Manage Rooms
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-[#837ab6] mb-4">
          System Overview
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Monitor users, owners, room approvals, and system activity.
          Pending rooms and owners require admin verification.
        </p>
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="text-[#837ab6]">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-[#837ab6] mt-3">
        {value}
      </p>
    </div>
  );
};

export default AdminDashboard;