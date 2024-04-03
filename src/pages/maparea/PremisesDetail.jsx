import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";
import "./premisesDetails.scss";
import Navbar from "../../components/navbar/Navbar";
import Sidebar from "../../components/sidebar/Sidebar";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { UserAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A";

const premisesDetails = {
  id: 1,
  name: "Example Premises",
  area: [],
  activityLog: [],
  employeesOutside: new Set(),
};

const PremisesDetailsPage = () => {
  const mapContainerRef = useRef(null);
  const { groupId: premiseId } = useParams();
  const [employeeUid, setEmployeeUid] = useState("");
  const [employeeListUID, setEmployeeListUID] = useState([]);

  const [premises, setPremise] = useState(null);

  const { currentUser } = UserAuth();
  const [employeeList, setEmployeeList] = useState([]);
  const fetchEmployeeDetails = async (employeeUids) => {
    try {
      const employeeDetails = [];
      if (!premises) return;
      for (const email of employeeUids) {
        console.log("emial", email);
        const q = await query(
          collection(db, "users"),
          where("email", "==", email)
        );
        const querySnapshot = await getDocs(q);
        console.log(querySnapshot);
        querySnapshot.forEach((doc) => {
          const employeeData = doc.data();
          console.log(employeeData);
          if (employeeData) {
            employeeDetails.push({
              id: doc.id,
              ...employeeData,
            });
          }
        });
      }

      setEmployeeList(employeeDetails); // Set the employee details to the state
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  console.log(employeeList, "employees");

  useEffect(() => {
    if (premises) {
      const employeesUnsubscribe = premises.employeeUids.map((employeeId) => {
        const employeeDocRef = doc(db, "user_locations", employeeId);
        return onSnapshot(employeeDocRef, (doc) => {
          if (doc.exists()) {
            const updatedEmployeeList = employeeList.map((employee) => {
              console.log(employee, employeeId);
              if (employee.email === employeeId) {
                console.log(employee);
                return {
                  ...employee,
                  location: [doc.data().longitude, doc.data().latitude],
                };
              }
              return employee;
            });
            setEmployeeList(updatedEmployeeList);
          } else {
            console.log(`Employee document with ID ${employeeId} not found`);
          }
        });
      });

      return () => {
        employeesUnsubscribe.forEach((unsub) => unsub());
      };
    }
  }, []);

  useEffect(() => {
    const fetchPremiseDetails = async () => {
      try {
        if (currentUser) {
          const premisesRef = doc(
            db,
            "user_premises",
            currentUser.uid,
            "premises",
            premiseId
          );
          const premiseSnapshot = await getDoc(premisesRef);
          console.log(premiseSnapshot.data());
          if (premiseSnapshot.exists()) {
            await setPremise({
              id: premiseSnapshot.id,
              ...premiseSnapshot.data(),
              area: JSON.parse(premiseSnapshot.data().area),
              activityLog: [],
              employeesOutside: new Set(),
            });
            fetchEmployeeDetails(premiseSnapshot.data().employeeUids);
          } else {
            console.log("Premise not found");
          }
        } else {
          console.log("User premises not found");
        }
      } catch (error) {
        console.error("Error fetching premise details:", error);
      }
    };

    fetchPremiseDetails();
  }, [premiseId]);

  useEffect(() => {
    if (!premises || !mapContainerRef.current) return; // Exit early if premises is null or map container is not initialized

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: premises.area[0],
      zoom: 12,
    });

    const premisesPolygon = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [premises.area],
      },
    };

    map.on("load", () => {
      map.addSource("premises", {
        type: "geojson",
        data: premisesPolygon,
      });

      map.addLayer({
        id: "premises-layer",
        type: "fill",
        source: "premises",
        layout: {},
        paint: {
          "fill-color": "#007bff",
          "fill-opacity": 0.5,
        },
      });

      employeeList.forEach((employee) => {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage = `url(${employee.profilePicture})`;
        el.style.backgroundColor = employee.online ? "green" : "red";
        const popup = new mapboxgl.Popup({ offset: 25 }).setText(employee.name);

        const marker = new mapboxgl.Marker(el)
          .setLngLat(employee.location)
          .setPopup(popup)
          .addTo(map);

        const point = turf.point(employee.location);
        const polygon = turf.polygon([premises.area]);
        const isInside = turf.booleanPointInPolygon(point, polygon);
        if (!isInside && !premises.employeesOutside.has(employee.name)) {
          updateActivityLog(employee.name, " went outside the premises");
          premises.employeesOutside.add(employee.name);
        } else if (isInside && premises.employeesOutside.has(employee.name)) {
          updateActivityLog(employee.name, " came inside the premises");
          premises.employeesOutside.delete(employee.name);
        }
      });

      const bounds = new mapboxgl.LngLatBounds();
      premises.area.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, { padding: 20 });
    });

    return () => map.remove();
  }, [employeeList, premises]);

  console.log(employeeList);

  const [activityLog, setActivityLog] = useState(
    premises ? premises.activityLog : []
  );

  const updateActivityLog = (employeeName, event) => {
    const time = new Date().toLocaleTimeString();
    setActivityLog((prevLog) => [...prevLog, { employeeName, event, time }]);
    premises.activityLog.push({ employeeName, event, time });
  };

  const handleAddEmployee = async () => {
    if (employeeUid.trim() !== "") {
      try {
        // Update the document with the new employee UID
        const premisesRef = doc(
          db,
          "user_premises",
          currentUser.uid,
          "premises",
          premiseId
        );
        await updateDoc(premisesRef, {
          employeeUids: [...employeeListUID, employeeUid],
        });

        // Update state with the new list of employee UIDs
        setEmployeeListUID((prevList) => [...prevList, employeeUid]);
        setEmployeeUid(""); // Clear input field after adding UID
      } catch (error) {
        console.error("Error adding employee UID:", error);
      }
    }
  };

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="premises-details-page">
          <div className="map-container" ref={mapContainerRef} />
          <div className="add-employee-container">
            <input
              type="text"
              placeholder="Enter Employee email"
              value={employeeUid}
              onChange={(e) => setEmployeeUid(e.target.value)}
            />
            <button onClick={handleAddEmployee}>Add Employee</button>
          </div>
          {premises && (
            <div className="premises-details">
              <div className="employee-list">
                <h2>Employee List</h2>
                {employeeList.map((employee) => (
                  <div key={employee.id} className="employee-card">
                    <img
                      src={employee.photoUrl}
                      alt={`Profile of ${employee.name}`}
                    />
                    <h3>{employee.name}</h3>
                    <p>
                      Online Status:{" "}
                      <span style={{ color: employee.statusColor }}>
                        {employee.online ? "Online" : "Offline"}
                      </span>
                    </p>
                    <p>
                      Location Status:{" "}
                      {employee.isInside
                        ? "Inside Premises"
                        : "Outside Premises"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="activity-log">
                <h2>Activity Log - Employees Outside Premises</h2>
                <ul>
                  {activityLog.map((log, index) => (
                    <li key={index}>
                      <span>{log.employeeName}</span>
                      <span>{log.event}</span>
                      <span>{log.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Function to generate random time (HH:MM format)

export default PremisesDetailsPage;
