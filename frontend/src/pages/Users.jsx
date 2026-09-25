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

  if (loading) {
    return <h2>Loading users...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="users-page">
      <h1>Users</h1>
      <p>Manage platform users</p>

      <div className="users-card">
        <h2>All Users</h2>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table>
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
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Users;