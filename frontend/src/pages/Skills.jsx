import { useEffect, useState } from "react";
import api from "../api";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("teach");
  const [editingSkill, setEditingSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const [requestingSkill, setRequestingSkill] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState("");
  const [message, setMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestError, setRequestError] = useState("");

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/api/skills", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSkills(response.data.skills);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load skills"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentUser(response.data.profile);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load user profile"
      );
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchCurrentUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (editingSkill) {
        await api.put(
          `/api/skills/${editingSkill._id}`,
          {
            name,
            type,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await api.post(
          "/api/skills",
          {
            name,
            type,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setName("");
      setType("teach");
      setEditingSkill(null);
      setError("");
      fetchSkills();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          (editingSkill
            ? "Failed to update skill"
            : "Failed to add skill")
      );
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setName(skill.name);
    setType(skill.type);
    setError("");
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await api.delete(`/api/skills/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (editingSkill?._id === id) {
        setEditingSkill(null);
        setName("");
        setType("teach");
      }

      setError("");
      fetchSkills();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete skill"
      );
    }
  };

  const handleCancel = () => {
    setEditingSkill(null);
    setName("");
    setType("teach");
    setError("");
  };

  const handleRequestSkill = (skill) => {
    setRequestingSkill(skill);
    setOfferedSkill("");
    setMessage("");
    setRequestMessage("");
    setRequestError("");
  };

  const handleCancelRequest = () => {
    setRequestingSkill(null);
    setOfferedSkill("");
    setMessage("");
    setRequestMessage("");
    setRequestError("");
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();

    if (!requestingSkill) {
      return;
    }

    try {
      setRequestLoading(true);
      setRequestMessage("");
      setRequestError("");

      const token = localStorage.getItem("token");

      const requestData = {
        receiver: requestingSkill.user._id,
        requestedSkill: requestingSkill._id,
        offeredSkill: offeredSkill || null,
        message,
      };

      const response = await api.post(
        "/api/skill-exchange-requests",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestMessage(
        response.data.message ||
          "Skill exchange request sent successfully"
      );

      setOfferedSkill("");
      setMessage("");
    } catch (error) {
      setRequestError(
        error.response?.data?.message ||
          "Failed to send exchange request"
      );
    } finally {
      setRequestLoading(false);
    }
  };

  const mySkills = skills.filter(
    (skill) => skill.user?._id === currentUser?.id
  );

  if (loading) {
    return <h2 className="mb-4 text-xl font-semibold text-slate-900">Loading skills...</h2>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">Skills</h1>
      <p className="my-2 text-sm leading-6 text-slate-600">Manage the skills you teach and want to learn.</p>

      {error && <p className="my-2 text-sm leading-6 text-slate-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter skill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        >
          <option value="teach">Teach</option>
          <option value="learn">Learn</option>
        </select>

        <button type="submit" className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
          {editingSkill ? "Update Skill" : "Add Skill"}
        </button>

        {editingSkill && (
          <button type="button" onClick={handleCancel} className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
            Cancel
          </button>
        )}
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">My Skills</h2>

        {mySkills.length === 0 ? (
          <p className="my-2 text-sm leading-6 text-slate-600">No skills added yet.</p>
        ) : (
          mySkills.map((skill) => (
            <div className="flex flex-col gap-4 border-b border-slate-100 py-5 last:border-b-0 md:flex-row md:items-center md:justify-between" key={skill._id}>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{skill.name}</h3>
                <p className="my-2 text-sm leading-6 text-slate-600">Type: {skill.type}</p>
              </div>

              <div>
                <p className="my-2 text-sm leading-6 text-slate-600">Name: {skill.user?.name}</p>
                <p className="my-2 text-sm leading-6 text-slate-600">Email: {skill.user?.email}</p>
                <p className="my-2 text-sm leading-6 text-slate-600">Role: {skill.user?.role}</p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleEdit(skill)}
                  className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(skill._id)}
                  className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Available Skills</h2>

        {skills.length === 0 ? (
          <p className="my-2 text-sm leading-6 text-slate-600">No skills available.</p>
        ) : (
          skills.map((skill) => {
            const isMySkill =
              skill.user?._id === currentUser?.id;

            return (
              <div className="flex flex-col gap-4 border-b border-slate-100 py-5 last:border-b-0 md:flex-row md:items-center md:justify-between" key={skill._id}>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{skill.name}</h3>
                  <p className="my-2 text-sm leading-6 text-slate-600">Type: {skill.type}</p>
                </div>

                <div>
                  <p className="my-2 text-sm leading-6 text-slate-600">Name: {skill.user?.name}</p>
                  <p className="my-2 text-sm leading-6 text-slate-600">Email: {skill.user?.email}</p>
                  <p className="my-2 text-sm leading-6 text-slate-600">Role: {skill.user?.role}</p>
                </div>

                {!isMySkill && (
                  <button
                    type="button"
                    onClick={() => handleRequestSkill(skill)}
                    className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Request Skill Exchange
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {requestingSkill && (
        <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-md sm:p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Request Skill Exchange</h2>

          <p className="my-2 text-sm leading-6 text-slate-600">
            Requesting: <strong>{requestingSkill.name}</strong>
          </p>

          <p className="my-2 text-sm leading-6 text-slate-600">
            From:{" "}
            <strong>{requestingSkill.user?.name}</strong>
          </p>

          <form onSubmit={handleSendRequest} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Your skill to offer</label>

            <select
              value={offeredSkill}
              onChange={(e) => setOfferedSkill(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            >
              <option value="">
                No skill offered
              </option>

              {mySkills.map((skill) => (
                <option
                  key={skill._id}
                  value={skill._id}
                >
                  {skill.name} ({skill.type})
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-slate-700">Message</label>

            <textarea
              placeholder="Write an optional message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full min-h-28 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />

            {requestMessage && (
              <p className="my-2 text-sm leading-6 text-slate-600">{requestMessage}</p>
            )}

            {requestError && (
              <p className="my-2 text-sm leading-6 text-slate-600">{requestError}</p>
            )}

            <button
              type="submit"
              disabled={requestLoading}
             className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
              {requestLoading
                ? "Sending..."
                : "Send Request"}
            </button>

            <button
              type="button"
              onClick={handleCancelRequest}
             className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50">
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Skills;