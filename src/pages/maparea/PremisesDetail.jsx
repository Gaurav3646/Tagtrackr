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
  query,
  updateDoc,
  where,
  onSnapshot, // Added Firestore listener
} from "firebase/firestore";
import { db } from "../../firebase";
import { UserAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A";

const PremisesDetailsPage = () => {
  const mapContainerRef = useRef(null);
  const { groupId: premiseId } = useParams();
  const [employeeUid, setEmployeeUid] = useState("");
  const [employeeListUID, setEmployeeListUID] = useState([]);
  const [map, setMap] = useState(null);

  const { currentUser } = UserAuth();
  const [employeeList, setEmployeeList] = useState([]);
  const [premises, setPremise] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  const fetchEmployeeDetails = async (employeeUids) => {
    try {
      const employeeDetails = await Promise.all(
        employeeUids.map(async (email) => {
          const userQuery = query(
            collection(db, "users"),
            where("email", "==", email)
          );
          const userSnapshot = await getDocs(userQuery);

          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            const userId = userSnapshot.docs[0].id;
            const userDataRef = userSnapshot.docs[0].ref;

            // Subscribe to real-time updates for user data
            const unsubscribeUser = onSnapshot(
              userDataRef,
              (userDataSnapshot) => {
                const updatedUserData = userDataSnapshot.data();
                setEmployeeList((prevEmployeeList) => {
                  const updatedList = prevEmployeeList.map((employee) => {
                    if (employee.email === email) {
                      return { ...employee, ...updatedUserData };
                    }
                    return employee;
                  });
                  return updatedList;
                });
              }
            );

            // Fetch initial location data
            const locationQuery = doc(db, "user_locations", email);
            const locationSnapshot = await getDoc(locationQuery);

            if (locationSnapshot.exists()) {
              const locationData = locationSnapshot.data();
              setEmployeeList((prevEmployeeList) => {
                const updatedList = prevEmployeeList.map((employee) => {
                  if (employee.email === email) {
                    return {
                      ...employee,
                      location: [locationData.longitude, locationData.latitude],
                    };
                  }
                  return employee;
                });
                return updatedList;
              });
            }

            // Subscribe to real-time updates for location data
            const unsubscribeLocation = onSnapshot(
              locationQuery,
              (locationSnapshot) => {
                if (locationSnapshot.exists()) {
                  const locationData = locationSnapshot.data();
                  setEmployeeList((prevEmployeeList) => {
                    const updatedList = prevEmployeeList.map((employee) => {
                      if (employee.email === email) {
                        return {
                          ...employee,
                          location: [
                            locationData.longitude,
                            locationData.latitude,
                          ],
                        };
                      }
                      return employee;
                    });
                    return updatedList;
                  });
                }
              }
            );

            // Return employee details along with the unsubscribe functions
            return {
              id: userId,
              ...userData,
              location: [], // Initialize location with empty array
              unsubscribeUser,
              unsubscribeLocation,
            };
          }

          return null; // Return null if user data not found
        })
      );

      const validEmployees = employeeDetails.filter((emp) => emp !== null);
      setEmployeeList(validEmployees);
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  console.log(employeeList);
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
          if (premiseSnapshot.exists()) {
            const premiseData = premiseSnapshot.data();
            setPremise({
              id: premiseSnapshot.id,
              ...premiseData,
              area: JSON.parse(premiseData.area),
              activityLog: [],
              employeesOutside: new Set(),
            });

            fetchEmployeeDetails(premiseData.employeeUids);
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
        console.log(employee);
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage = `url(${employee.photoUrl})`;
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
          // updateActivityLog(employee.name, " went outside the premises");
          premises.employeesOutside.add(employee.name);
        } else if (isInside && premises.employeesOutside.has(employee.name)) {
          // updateActivityLog(employee.name, " came inside the premises");
          premises.employeesOutside.delete(employee.name);
        }
      });
    });
    setMap(map);

    return () => map.remove();
  }, [premises, employeeList]);

  useEffect(() => {
    if (!premises || !mapContainerRef.current || !map) return; // Exit early if premises is null or map container is not initialized
    console.log(map);
    map.on("load", () => {
      employeeList.forEach((employee) => {
        console.log(employee);
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundImage = `url(${employee.photoUrl})`;
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
          // updateActivityLog(employee.name, " went outside the premises");
          premises.employeesOutside.add(employee.name);
        } else if (isInside && premises.employeesOutside.has(employee.name)) {
          // updateActivityLog(employee.name, " came inside the premises");
          premises.employeesOutside.delete(employee.name);
        }
      });

      const bounds = new mapboxgl.LngLatBounds();
      premises.area.forEach((point) => bounds.extend(point));
      map.fitBounds(bounds, { padding: 20 });
    });
  }, [employeeList, premises]);

  useEffect(() => {
    const updateActivityLog = (employeeName, event) => {
      const time = new Date().toLocaleTimeString();
      setActivityLog((prevLog) => [...prevLog, { employeeName, event, time }]);
      setPremise((prevPremise) => ({
        ...prevPremise,
        activityLog: [
          ...prevPremise.activityLog,
          { employeeName, event, time },
        ],
      }));
    };
  }, []); // This effect runs only once on component mount

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
          employeeUids: [...premises.employeeUids, employeeUid],
        });

        // Update state with the new list of employee UIDs
        // await setEmployeeListUID((prevList) => [...prevList, employeeUid]);

        fetchEmployeeDetails([...premises.employeeUids, employeeUid]);
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
                        {employee.status}
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
              {/* <div className="activity-log">
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
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremisesDetailsPage;
