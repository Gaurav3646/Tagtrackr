import React, { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import PremisesCard from "./PremisesCard.jsx";
import "./maparea.scss";

import "mapbox-gl/dist/mapbox-gl.css";
import Sidebar from "../../components/sidebar/Sidebar.jsx";
import Navbar from "../../components/navbar/Navbar.jsx";
import { db } from "../../firebase.js";
import { UserAuth } from "../../context/AuthContext.js";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A";

const MapPage = () => {
  const [map, setMap] = useState(null);
  const [draw, setDraw] = useState(null);
  const [premisesList, setPremisesList] = useState([]);
  const [premisesName, setPremisesName] = useState("");
  const [flag, setFlag] = useState(false);

  const { currentUser } = UserAuth();

  console.log(currentUser);

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-68.137343, 45.137451],
        zoom: 5,
      });

      const drawInstance = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });

      mapInstance.on("load", () => {
        setMap(mapInstance);
        setDraw(drawInstance);
        mapInstance.addControl(drawInstance);

        mapInstance.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true,
            },
            trackUserLocation: true,
          })
        );

        // mapInstance.addControl(
        //   new MapboxGeocoder({
        //     accessToken: mapboxgl.accessToken,
        //     mapboxgl: mapboxgl,
        //     marker: false,
        //     placeholder: "Search for a location",
        //   })
        // );

        const geocoder = new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
          marker: false,
          placeholder: "Search for a location",
        });

        geocoder.on("result", (event) => {
          mapInstance.flyTo({
            center: event.result.center,
            zoom: 16, // Adjust the zoom level as needed
          });
        });

        mapInstance.addControl(geocoder);
      });

      return () => {
        mapInstance.remove();
      };
    };

    initializeMap();
  }, []);

  useEffect(() => {
    const fetchPremises = async () => {
      if (currentUser) {
        const premisesRef = collection(
          db,
          "user_premises",
          currentUser.uid,
          "premises"
        );
        const premisesSnapshot = await getDocs(premisesRef);
        const premisesData = [];
        premisesSnapshot.forEach((doc) => {
          premisesData.push({
            id: doc.id,
            ...doc.data(),

            area: JSON.parse(doc.data().area),
          });
        });
        setPremisesList(premisesData);
      }
    };

    fetchPremises();
  }, [currentUser, flag]);

  const handleAddPremises = async () => {
    try {
      const data = draw.getAll();
      if (data.features.length > 0) {
        console.log(data.features[0].geometry.coordinates.flat());
        const premises = {
          name: premisesName,
          area: JSON.stringify(data.features[0].geometry.coordinates[0]),
          employeeUids: [],
          // You can add more properties as needed
        };

        if (currentUser) {
          const mainCollectionRef = collection(db, "user_premises");
          const mainDocRef = doc(mainCollectionRef, `${currentUser.uid}`);

          const subcollectionRef = collection(mainDocRef, "premises");
          const subcollectionDocRef = doc(subcollectionRef);
          await setDoc(subcollectionDocRef, premises);
          console.log("Premises added successfully!");
          // setPremisesList([...premisesLi]);
          setPremisesName("");
          setFlag((prev) => !prev);
          draw.deleteAll();
        }
        // setPremisesList([...premisesList, premises]);
        // draw.deleteAll();
      }
    } catch (error) {
      console.log("Error adding premises: ", error);
    }
  };

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div style={{ height: "auto", paddingBottom: "20px" }}>
          <div id="map" style={{ width: "100%", height: "500px" }} />
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter Premises Name"
              value={premisesName}
              onChange={(e) => setPremisesName(e.target.value)}
            />
            <button onClick={handleAddPremises}>Add Premises</button>
          </div>
          <div className="premises-list">
            <h2>Premises List</h2>
            <div className="premises-grid">
              {premisesList.map((premises) => (
                <PremisesCard key={premises.id} premises={premises} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
