
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const token = window.location.pathname.split("/").pop();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await api.post(
        `/api/auth/reset-password/${token}`,
        { password }
      );

      alert(response.data.message);
      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to reset password"
      );
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>

      <p>
        Enter a new password containing at least 8 characters,
        including uppercase and lowercase letters, a number,
        and a special character (@$!%*?&).
      </p>

      <form onSubmit={handleSubmit}>
  <input
    type="password"
    placeholder="Enter new password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />

  <input
    type="password"
    placeholder="Confirm new password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
  />

  <button type="submit">Reset Password</button>
</form>
      <p>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}

export default ResetPassword;
