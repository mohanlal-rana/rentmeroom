import { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext.jsx";

function AdminDashboard() {
  const { API } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalRooms: 0,
    totalActiveUsers: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="min-h-screen bg-[#f6f4fa] p-8">
      <h1 className="text-3xl font-bold text-[#837ab6] mb-8">
        Admin Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Owners" value={stats.totalOwners} />
        <StatCard title="Total Rooms" value={stats.totalRooms} />
        <StatCard
          title="Active Users"
          value={stats.totalActiveUsers}
        />
      </div>

      {/* Future Section */}
      <div className="mt-10 bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold text-[#837ab6] mb-4">
          System Overview
        </h2>
        <p className="text-gray-600 text-sm">
          Manage users, verify owners, monitor rooms, and control system
          activities from this dashboard.
        </p>
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:scale-105 transition-transform duration-200">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-[#837ab6] mt-2">
        {value}
      </p>
    </div>
  );
};

export default AdminDashboard;