import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateProfile,
  uploadProfileImage,
  clearProfileMessage,
} from "../store/profileSlice";

function Profile() {
  const dispatch = useDispatch();

  const {
    profile,
    loading,
    updating,
    uploadingImage,
    error,
    successMessage,
  } = useSelector((state) => state.profile);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleEdit = () => {
    dispatch(clearProfileMessage());

    setName(profile?.name || "");
    setBio(profile?.bio || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    dispatch(clearProfileMessage());

    setName(profile?.name || "");
    setBio(profile?.bio || "");
    setIsEditing(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      updateProfile({
        name,
        bio,
      })
    );

    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    dispatch(uploadProfileImage(file));
  };

  if (loading) {
    return <h2>Loading profile...</h2>;
  }

  if (!profile) {
    return <h2>Profile not found.</h2>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-image">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt="Profile"
            />
          ) : (
            <span>👤</span>
          )}
        </div>

        <h1>My Profile</h1>
        <p>Your profile information</p>

        {profile.role !== "admin" && (
          <div>
            <label>
              Change Profile Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
            />
          </div>
        )}
      </div>

      {error && <p>{error}</p>}

      {successMessage && (
        <p>{successMessage}</p>
      )}

      <div className="profile-card">
        <h2>Profile Information</h2>

        {!isEditing ? (
          <>
            <p>
              <strong>Name:</strong>{" "}
              {profile.name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {profile.email}
            </p>

            <p>
              <strong>Role:</strong>{" "}
              {profile.role}
            </p>

            <p>
              <strong>Bio:</strong>{" "}
              {profile.bio || "No bio added"}
            </p>

            {profile.skills &&
              profile.skills.length > 0 && (
                <div>
                  <h3>Skills</h3>

                  {profile.skills.map((skill) => (
                    <p key={skill._id}>
                      {skill.name} - {skill.type}
                    </p>
                  ))}
                </div>
              )}

            {profile.role !== "admin" && (
              <button
                type="button"
                onClick={handleEdit}
              >
                Edit Profile
              </button>
            )}
          </>
        ) : (
          <form onSubmit={handleUpdate}>
            <div>
              <label>Name</label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </div>

            <div>
              <label>Email</label>

              <input
                type="email"
                value={profile.email}
                disabled
              />
            </div>

            <div>
              <label>Role</label>

              <input
                type="text"
                value={profile.role}
                disabled
              />
            </div>

            <div>
              <label>Bio</label>

              <textarea
                value={bio}
                onChange={(e) =>
                  setBio(e.target.value)
                }
                placeholder="Tell something about yourself"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
            >
              {updating
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;