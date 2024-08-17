import React, { useState } from "react";
import { updateProfile } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase"; // Import db for Firestore
import { doc, updateDoc } from "firebase/firestore";

const EditableProfile = ({ onClose }) => {
  const { currentUser, auth } = useAuth(); // Destructure auth from useAuth
  const [userName, setuserName] = useState(currentUser?.displayName || "");
  const [profile, setPicture] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setPicture(e.target.files[0]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let profilePicture = currentUser.photoURL;

      if (profile) {
        const photoRef = ref(storage, `profile_pictures/${currentUser.uid}`);
        await uploadBytes(photoRef, profile);
        profilePicture = await getDownloadURL(photoRef);
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: userName,
        photoURL: profilePicture,
      });

      // Update Firestore profile
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        userName,
        profilePicture,
      });

      onClose(); // Close the editing form
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editable-profile">
      <h2>Edit Profile</h2>
      <marquee
        behavior=""
        direction=""
        style={{ color: "red", fontSize: "15px" }}
      >
        After any profile update refresh the page
      </marquee>
      <input
        type="text"
        value={userName}
        onChange={(e) => setuserName(e.target.value)}
        placeholder="Display Name"
      />
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <div className="editbtn">
        <button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default EditableProfile;
