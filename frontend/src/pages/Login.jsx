
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post(
        "/api/auth/login",
        formData
      );

      localStorage.setItem("token", response.data.token);

      alert("Login successful");
      navigate("/dashboard");
    } catch (error) {
      console.log(error.response?.data);

      alert(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F6FA] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[#DCE4EF] bg-white shadow-xl md:grid-cols-2">

        {/* Left section */}
        <div className="hidden flex-col justify-between bg-[#142D4E] p-10 text-white md:flex">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/75">
              Skill Exchange Platform
            </p>

            <h1 className="mt-10 text-4xl font-bold leading-tight">
              Learn something new.
              <br />
              Share what you know.
            </h1>

            <p className="mt-5 max-w-sm text-base leading-7 text-white/75">
              Connect with mentors, exchange skills, and
              grow together with a community of learners.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
            <p className="text-lg font-semibold">
              Your next learning journey starts here.
            </p>
            <p className="mt-2 text-sm text-white/75">
              Sign in to continue exploring your skills.
            </p>
          </div>
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center p-6 sm:p-10 md:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-sm font-semibold text-[#4F86F7] md:hidden">
                SKILL EXCHANGE PLATFORM
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#142D4E]">
                Welcome back
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#142D4E]/65">
                Enter your details to sign in to your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#142D4E]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[#DCE4EF] bg-white px-4 py-3 text-sm text-[#142D4E] outline-none transition placeholder:text-slate-400 focus:border-[#4F86F7] focus:ring-4 focus:ring-[#4F86F7]/15"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#142D4E]"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold text-[#4F86F7] transition hover:text-[#142D4E]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-[#DCE4EF] bg-white px-4 py-3 text-sm text-[#142D4E] outline-none transition placeholder:text-slate-400 focus:border-[#4F86F7] focus:ring-4 focus:ring-[#4F86F7]/15"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#4F86F7] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3B73E6] focus:outline-none focus:ring-4 focus:ring-[#4F86F7]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#4F86F7] hover:text-[#142D4E]"
              >
                Create an account
              </Link>
            </p>

            <p className="mt-10 text-center text-xs text-[#142D4E]/45">
              Skill Exchange Platform
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
