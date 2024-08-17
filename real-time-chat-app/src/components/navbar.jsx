import React from "react";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import DisplayProfile from "../components/displayProfile";

const Navbar = ({ onToggleTheme, isDarkMode }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); 
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <div className="nav-wrapper">
      <h1>eX Cnt</h1>
      <nav>
        {currentUser ? (
          <div className="and-wrapper">
            <DisplayProfile />
            <button onClick={handleLogout}>Logout</button>
            
            <label className="switch">
              <input type="checkbox" checked={isDarkMode} onChange={onToggleTheme} />
              <span className="slider">
                <span className="circle">
                  <span className="shine shine-1"></span>
                  <span className="shine shine-2"></span>
                  <span className="shine shine-3"></span>
                  <span className="shine shine-4"></span>
                  <span className="shine shine-5"></span>
                  <span className="shine shine-6"></span>
                  <span className="shine shine-7"></span>
                  <span className="shine shine-8"></span>
                  <span className="moon"></span>
                </span>
              </span>
            </label>
          </div>
        ) : (
          <div className="btn-wrapper">
            <Link to="/">
              <button className="btn">Login</button>
            </Link>
            <Link to="/register">
              <button className="btn">Register</button>
            </Link>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
