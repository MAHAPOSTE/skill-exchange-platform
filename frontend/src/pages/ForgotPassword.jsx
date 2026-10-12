
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/auth/forgot-password", {
        email,
      });

      alert(response.data.message);
      setEmail("");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to send password reset email"
      );
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>

      <p>Enter your registered email address to reset your password.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send Reset Link</button>
      </form>

      <p>
        Remember your password? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;
