import React, { useEffect } from "react";
import { GoogleButton } from "react-google-button";
import { UserAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./login.scss";
const Signin = () => {
  const { googleSignIn, currentUser } = UserAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
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
      <div className="modelcontainer">
        <div className="model">
          <div className="title">
            <h1>Sign In</h1>
          </div>
          <div className="buttonContainer">
            <span className="signInButton">
              <GoogleButton onClick={handleGoogleSignIn} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
