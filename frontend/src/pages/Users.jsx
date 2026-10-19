
import { useEffect, useState } from "react";
import api from "../api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/api/users/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(response.data.users);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to fetch users"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="users-page min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <style>{`
        .users-page {
          color: #1e293b;
        }

        .users-card {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
        }

        .users-table-wrapper {
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .users-table th {
          background: #f8fafc;
          padding: 16px 22px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .users-table td {
          border-top: 1px solid #f1f5f9;
          padding: 17px 22px;
          font-size: 14px;
        }

        .users-table tbody tr:hover {
          background: #f8fafc;
        }

        .users-role {
          display: inline-block;
          border-radius: 999px;
          background: #ede9fe;
          padding: 5px 11px;
          color: #6d28d9;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .users-status {
          border-radius: 14px;
          background: white;
          padding: 22px;
          color: #64748b;
          text-align: center;
        }

        @media (max-width: 640px) {
          .users-table th,
          .users-table td {
            padding: 13px 14px;
          }
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-600">
            Administration
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Users
          </h1>
          <p className="mt-2 text-slate-500">
            View and manage members of your Skill Exchange Platform.
          </p>
        </div>

        {loading ? (
          <div className="users-status">Loading users...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </div>
        ) : (
          <div className="users-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  All Users
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Registered platform members
                </p>
              </div>

              <span className="rounded-full bg-violet-100 px-3 py-1.5 text-sm font-semibold text-violet-700">
                {users.length} {users.length === 1 ? "User" : "Users"}
              </span>
            </div>

            {users.length === 0 ? (
              <div className="users-status m-5">
                No users found.
              </div>
            ) : (
              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="font-semibold text-slate-800">
                          {user.name}
                        </td>
                        <td className="text-slate-600">
                          {user.email}
                        </td>
                        <td>
                          <span className="users-role">
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
