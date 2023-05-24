import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import List from "../../components/table/Table";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { DateRangePickerDay } from "@mui/lab";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Map from "../../components/Map/Map";
import CheckInCheckOut from "../../components/CheckInCheckOut/CheckInCheckOut";

const Single = () => {
  const { userId } = useParams();
  console.log(userId);
  const [user, setUser] = useState();
  const docRef = doc(db, "users", userId);
  // Get a document, forcing the SDK to fetch from the offline cache.
  useEffect(() => {
    const unsub = onSnapshot(docRef, (doc) => {
      setUser(doc.data());
      console.log("Current data: ", doc.data());
    });
    return () => unsub();
  }, []);

  return (
    <div className="single">
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div className="top">
          <div className="left">
            <div className="editButton">Edit</div>
            <h1 className="title">Information</h1>
            {user && (
              <div className="item">
                <img src={user.photoUrl} alt="" className="itemImg" />

                <div className="details">
                  <h1 className="itemTitle">{user.name}</h1>
                  <div className="detailItem">
                    <span className="itemKey">Email:</span>
                    <span className="itemValue">{user.email}</span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Phone:</span>
                    <span className="itemValue">+1 2345 67 89</span>
                  </div>
                  <div className="detailItem">
                    <span className="itemKey">Status:</span>

                    <span className={`itemValue cellWithStatus ${user.status}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="right">
            <Chart aspect={3 / 1} title="User Spending ( Last 6 Months)" />
          </div>
        </div>

        <div className="top">
          <div className="left">
            <CheckInCheckOut />
          </div>
          <div className="bottom">{user && <Map userId={userId} />}</div>
        </div>
      </div>
    </div>
  );
};

export default Single;
