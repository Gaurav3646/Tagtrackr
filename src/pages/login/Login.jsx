import React, { useEffect, useState } from "react";
import { GoogleButton } from "react-google-button";
import { UserAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mac1.png";
import "./login.scss";

const Signin = () => {
  const { googleSignIn, currentUser } = UserAuth();
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      // navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (currentUser != undefined) {
      console.log(currentUser != undefined);
      console.log("logged in");
      navigate("/");
    }
  }, [currentUser, googleSignIn]);

  return (
    <div className="signInContainer">
      <div className="left">
        <div className={`logo-container ${isHovered ? "hovered" : ""}`}>
          <img
            src={logo}
            alt="Company Logo"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          <div className="logo-text">Admin Dashboard</div>
        </div>
      </div>

      <div className="right">
        <div className="intro">
          <h1>Welcome to TagTrakr</h1>
          <p>
            Track employee and student activities, attendance, and work hours
            with ease.
          </p>
        </div>
        <div className="buttonContainer">
          <span className="signInButton">
            <GoogleButton onClick={handleGoogleSignIn} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signin;
