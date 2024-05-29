import React, { useState, useEffect } from "react";
import "./profile.scss";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { auth } from "../../firebase";

import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { UserAuth } from "../../context/AuthContext";

const Profile = () => {
  const { currentUser } = UserAuth();
  console.log(currentUser);
  const getStatusColor = () => {
    return currentUser && currentUser?.status !== "online" ? "green" : "red";
  };

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="profile">
          <div className="avatar-profile">
            <div
              className="avatar-circle"
              style={{
                backgroundColor: "red",
                overflow: "hidden",
              }}
            >
              {currentUser && currentUser.photoURL && (
                <img
                  src={currentUser.photoURL}
                  alt="User Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
          </div>
          <div className="info">
            {currentUser && currentUser.displayName && (
              <h2 className="name">{currentUser.displayName}</h2>
            )}

            {currentUser && currentUser.email && (
              <p className="email">Email: {currentUser.email}</p>
            )}
            {currentUser && (
              <p className="status" style={{ color: getStatusColor() }}>
                Status: {"Online"}
              </p>
            )}
            <p className="description">Admin powers are the real powers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
