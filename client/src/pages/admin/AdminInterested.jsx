import { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext.jsx";

const AdminInterested = () => {
  const { API } = useAuth();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Build address string
  const buildAddress = (addr) => {
    if (!addr) return "N/A";

    return [
      addr.houseNo,
      addr.street,
      addr.wardNo && `Ward ${addr.wardNo}`,
      addr.municipality,
      addr.district,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // 🔹 Fetch
  const fetchInterests = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API}/api/interested/admin/interests`, {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setInterests(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Update Status
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/api/interested/admin/interests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success) {
        // ⚡ Optimistic UI update
        setInterests((prev) =>
          prev.map((item) =>
            item._id === id
              ? {
                  ...item,
                  status,
                  room: {
                    ...item.room,
                    contact:
                      status === "contacted"
                        ? item.room.contact
                        : null,
                  },
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Interested Users</h2>

      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">User</th>
              <th className="p-3 border">Room</th>
              <th className="p-3 border">Rent</th>
              <th className="p-3 border">Address</th>
              <th className="p-3 border">Message</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Contact</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {interests.map((i) => (
              <tr key={i._id} className="text-center hover:bg-gray-50">
                <td className="p-3 border">
                  <div className="font-semibold">{i.user?.name}</div>
                  <div className="text-sm text-gray-500">
                    {i.user?.email}
                  </div>
                </td>

                <td className="p-3 border">{i.room?.title}</td>

                <td className="p-3 border">
                  Rs. {i.room?.rent}
                </td>

                <td className="p-3 border">
                  {buildAddress(i.room?.address)}
                </td>

                <td className="p-3 border">{i.message}</td>

                <td className="p-3 border">
                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm ${
                      i.status === "pending"
                        ? "bg-yellow-500"
                        : i.status === "contacted"
                        ? "bg-green-600"
                        : "bg-red-500"
                    }`}
                  >
                    {i.status}
                  </span>
                </td>

                <td className="p-3 border">
                  {i.room?.contact || "Hidden"}
                </td>

                <td className="p-3 border space-x-2">
                  <button
                    onClick={() =>
                      updateStatus(i._id, "contacted")
                    }
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Contact
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(i._id, "rejected")
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInterested;