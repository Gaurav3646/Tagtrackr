import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import List from "../../components/table/Table";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Map from "../../components/Map/Map";
import CheckInCheckOut from "../../components/CheckInCheckOut/CheckInCheckOut";
import { UserAuth } from "../../context/AuthContext";

const Single = () => {
  const [startCheckInDate, setStartCheckInDate] = useState(new Date());
  const { startDate, setStartDate } = UserAuth();
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

  const options = {
    timeZone: "Asia/Kolkata",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  };
  const tempData = [];
  // const [startDate, setStartDate] = useState(new Date());

  const deDate = startDate.toLocaleDateString("en-US", options).split("/");
  const fir = `${deDate[2]}-${deDate[0]}-${deDate[1]}`;
  const [data, setData] = useState([]);

  useEffect(() => {
    var i = 6;
    const fetchData = async () => {
      while (i >= 0) {
        const d = new Date(startDate - 24 * 60 * 60 * 1000 * i);
        console.log(d);
        const deDate = d.toLocaleDateString("en-US", options).split("/");
        const id = `${deDate[2]}-${deDate[0]}-${deDate[1]}`;
        console.log(id);

        const docRef = doc(db, "attendence", id);
        // const [data, setData] = useState();
        // const { userId } = useParams();
        // Get a document, forcing the SDK to fetch from the offline cache.

        const docSnap = await getDoc(docRef);
        const obj = docSnap.data();
        let time = 0;
        if (obj) {
          Object.keys(obj).forEach((key) => {
            if (userId === obj[key].email) {
              const t =
                (new Date([
                  "2023-04-28",
                  obj[key].checkOutTime === "nil"
                    ? "24:00:00"
                    : obj[key].checkOutTime,
                ]) -
                  new Date(["2023-04-28", obj[key].checkInTime])) /
                60000;
              console.log(t);
              time = time + t;
            }
          });
        }
        console.log(time);
        tempData.push({
          name: docSnap.id,
          Total: time.toFixed(2),
        });

        i = i - 1;
      }
      setData(tempData);
    };
    fetchData();
  }, [startDate]);
  console.log(data);

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
            <Chart
              aspect={3 / 1}
              title="User work hours ( Last 7 days)"
              data={data}
            />
          </div>
        </div>

        <div className="top">
          <div className="left check">
            <ReactDatePicker
              selected={startCheckInDate}
              onChange={(date) => setStartCheckInDate(date)}
            />

            <CheckInCheckOut selectedDate={startCheckInDate} />
          </div>
          <div className="bottom">{user && <Map userId={userId} />}</div>
        </div>
      </div>
    </div>
  );
};

export default Single;
