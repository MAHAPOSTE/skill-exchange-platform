function Profile() {
  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-image">
          <span>👤</span>
        </div>

        <h1>My Profile</h1>
        <p>Your profile information</p>
      </div>

      <div className="profile-card">
        <h2>Profile Information</h2>

        <p>Name</p>
        <p>Email</p>
        <p>Role</p>
        <p>Bio</p>
      </div>
    </div>
  );
}

export default Profile;