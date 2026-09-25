import { useEffect, useState } from "react";
import api from "../api";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("teach");
  const [editingSkill, setEditingSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    fetchSkills();
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

        {skills.length === 0 ? (
          <p>No skills added yet.</p>
        ) : (
          skills.map((skill) => (
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
    </div>
  );
}

export default Skills;