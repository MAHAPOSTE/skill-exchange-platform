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
    setName(profile.name || "");
    setBio(profile.bio || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    dispatch(clearProfileMessage());
    setName(profile.name || "");
    setBio(profile.bio || "");
    setIsEditing(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const result = await dispatch(
      updateProfile({ name: name.trim(), bio: bio.trim() })
    );

    if (updateProfile.fulfilled.match(result)) {
      setIsEditing(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.target.value = "";
      return;
    }

    dispatch(uploadProfileImage(file));
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <p className="text-lg font-medium text-violet-700">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error || "Profile not found. Please try again."}
        <button
          type="button"
          onClick={() => dispatch(fetchProfile())}
          className="ml-3 rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const skills = Array.isArray(profile.skills) ? profile.skills : [];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-36 bg-gradient-to-r from-violet-700 via-purple-600 to-indigo-600 sm:h-48" />

          <div className="px-6 pb-8 sm:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
  <div className="relative -mt-16 h-32 w-32 shrink-0 sm:-mt-20 sm:h-40 sm:w-40">
    {profile.profileImage ? (
      <img
        src={profile.profileImage}
        alt={`${profile.name}'s profile`}
        className="h-full w-full rounded-full border-4 border-white bg-white object-cover shadow-md"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-violet-100 text-5xl font-bold text-violet-700 shadow-md">
        {(profile.name || "?").charAt(0).toUpperCase()}
      </div>
    )}
  </div>

  <div className="min-w-0 flex-1 pb-1 sm:pb-2">
    <h1 className="break-words text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
      {profile.name}
    </h1>

    <p className="mt-2 break-all text-slate-500">
      {profile.email}
    </p>

    <span className="mt-3 inline-flex rounded-full bg-violet-100 px-4 py-1 text-sm font-semibold capitalize text-violet-800">
      {profile.role}
    </span>
  </div>
            </div>

            {profile.role !== "admin" && (
              <div className="mt-6">
                <label
                  htmlFor="profileImage"
                  className="inline-flex cursor-pointer items-center rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                >
                  {uploadingImage ? "Uploading image..." : "Change profile picture"}
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="sr-only"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Choose an image from your device.
                </p>
              </div>
            )}
          </div>
        </section>

        {(error || successMessage) && (
          <div
            role="status"
            className={`mt-5 rounded-xl border p-4 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || successMessage}
          </div>
        )}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Profile information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your personal details and skills
              </p>
            </div>

            {profile.role !== "admin" && !isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold text-white transition hover:bg-violet-700"
              >
                Edit profile
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">Full name</p>
                <p className="mt-2 break-words font-semibold text-slate-900">
                  {profile.name || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">Email address</p>
                <p className="mt-2 break-all font-semibold text-slate-900">
                  {profile.email || "Not provided"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
                <p className="text-sm font-medium text-slate-500">About me</p>
                <p className="mt-2 whitespace-pre-wrap break-words leading-7 text-slate-700">
                  {profile.bio || "You haven't added a bio yet."}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
                <div className="mb-4">
                  <h3 className="font-semibold text-slate-900">My skills</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Skills you teach or want to learn
                  </p>
                </div>

                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill, index) => (
                      <div
                        key={skill._id || `${skill.name}-${index}`}
                        className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3"
                      >
                        <p className="font-semibold text-violet-900">
                          {skill.name}
                        </p>
                        <p className="mt-1 text-xs capitalize text-violet-700">
                          {skill.type || "Skill"}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No skills added yet.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Role
                </label>
                <input
                  id="role"
                  type="text"
                  value={profile.role || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 capitalize text-slate-500"
                />
              </div>

              <div>
                <label
                  htmlFor="bio"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  About me
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  placeholder="Tell others about yourself and the skills you enjoy sharing..."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updating || !name.trim()}
                  className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating ? "Saving..." : "Save changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={updating}
                  className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

export default Profile;
