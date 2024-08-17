import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import EditableProfile from "./EditableProfile";

const DisplayProfile = () => {
  const { currentUser } = useAuth();
  const [editing, setEditing] = useState(false);

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCloseEdit = () => {
    setEditing(false);
  };

  return (
    <>
      {currentUser ? (
        <div className="profile-header">
          <img
            src={currentUser.photoURL}
            alt="Profile"
            className="profile-picture-large"
            onClick={handleEditClick}
          />
          <span
            className="profile-name"
            onClick={handleEditClick}
          >
            {currentUser.displayName}
          </span>
          {editing && <EditableProfile onClose={handleCloseEdit} />}
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default DisplayProfile;
