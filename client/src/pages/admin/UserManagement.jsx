import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext.jsx";

export default function UserManagement() {
  const { API } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API}/api/users`, {
          credentials: "include",
        });
        const data = await res.json();
        setUsers(data || []);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [API]);

  // filter + search
  const filteredUsers = users.filter((user) => {
    const roleMatch = roleFilter === "all" || user.role === roleFilter;

    const verifiedMatch =
      verifiedFilter === "all" ||
      (verifiedFilter === "verified" && user.owner?.isVerified) ||
      (verifiedFilter === "unverified" && !user.owner?.isVerified);

    const searchMatch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return roleMatch && verifiedMatch && searchMatch;
  });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-[#837ab6]">
        Loading users...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f6f4fa] px-6 py-10">
      <div className="min-w-full mx-auto">
        <h1 className="text-3xl font-bold text-center text-[#837ab6] mb-8">
          User Management
        </h1>

        {/* search + filters */}
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 rounded-xl border w-full md:w-72"
          />

          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="owner">Owner</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* table */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#ece9f7] text-[#837ab6]">
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Verified</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}

              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-6 py-4 font-semibold text-[#837ab6]">
                    {user.name}
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 capitalize text-center">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.owner?.isVerified ? "✔" : "✖"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.isActive ? "🟢 Active" : "🔴 Blocked"}
                  </td>
                  <p className="text-lg text-gray-400 mt-1 text-center">
                    
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => navigate(`/admin/users/${user._id}`)}
                      className="px-3 py-1 bg-[#837ab6] text-white rounded-lg"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
