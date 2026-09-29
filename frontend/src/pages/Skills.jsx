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
    return <h2>Loading skills...</h2>;
  }

  return (
    <div className="skills-page">
      <h1>Skills</h1>
      <p>Manage the skills you teach and want to learn.</p>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter skill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="teach">Teach</option>
          <option value="learn">Learn</option>
        </select>

        <button type="submit">
          {editingSkill ? "Update Skill" : "Add Skill"}
        </button>

        {editingSkill && (
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </form>

      <div className="skills-card">
        <h2>My Skills</h2>

        {mySkills.length === 0 ? (
          <p>No skills added yet.</p>
        ) : (
          mySkills.map((skill) => (
            <div className="skill-item" key={skill._id}>
              <div>
                <h3>{skill.name}</h3>
                <p>Type: {skill.type}</p>
              </div>

              <div>
                <p>Name: {skill.user?.name}</p>
                <p>Email: {skill.user?.email}</p>
                <p>Role: {skill.user?.role}</p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleEdit(skill)}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(skill._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="skills-card">
        <h2>Available Skills</h2>

        {skills.length === 0 ? (
          <p>No skills available.</p>
        ) : (
          skills.map((skill) => {
            const isMySkill =
              skill.user?._id === currentUser?.id;

            return (
              <div className="skill-item" key={skill._id}>
                <div>
                  <h3>{skill.name}</h3>
                  <p>Type: {skill.type}</p>
                </div>

                <div>
                  <p>Name: {skill.user?.name}</p>
                  <p>Email: {skill.user?.email}</p>
                  <p>Role: {skill.user?.role}</p>
                </div>

                {!isMySkill && (
                  <button
                    type="button"
                    onClick={() => handleRequestSkill(skill)}
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
        <div className="exchange-request-form">
          <h2>Request Skill Exchange</h2>

          <p>
            Requesting: <strong>{requestingSkill.name}</strong>
          </p>

          <p>
            From:{" "}
            <strong>{requestingSkill.user?.name}</strong>
          </p>

          <form onSubmit={handleSendRequest}>
            <label>Your skill to offer</label>

            <select
              value={offeredSkill}
              onChange={(e) =>
                setOfferedSkill(e.target.value)
              }
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

            <label>Message</label>

            <textarea
              placeholder="Write an optional message"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
            />

            {requestMessage && (
              <p>{requestMessage}</p>
            )}

            {requestError && (
              <p>{requestError}</p>
            )}

            <button
              type="submit"
              disabled={requestLoading}
            >
              {requestLoading
                ? "Sending..."
                : "Send Request"}
            </button>

            <button
              type="button"
              onClick={handleCancelRequest}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Skills;