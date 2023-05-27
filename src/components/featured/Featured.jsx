import "./featured.scss";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { getDoc, doc } from "firebase/firestore";

const Featured = () => {
  const options = {
    timeZone: "Asia/Kolkata",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  };
  const tempData = [];
  const [startDate, setStartDate] = useState(new Date());
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const d = new Date(startDate);
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
        });
      }
      console.log(time);
      setTotalTime(time.toFixed(2));
    };
    fetchData();
  }, [startDate]);
  console.log(totalTime);
  return (
    <div className="featured">
      <div className="top">
        <h1 className="title">Total Hours</h1>
        <MoreVertIcon fontSize="small" />
      </div>
      <div className="bottom">
        <div className="featuredChart">
          <CircularProgressbar
            value={(totalTime * 100) / (24 * 60 * 60)}
            text={`${((totalTime * 100) / (24 * 60)).toFixed(2)}%`}
            strokeWidth={5}
          />
        </div>
        <p className="title">Today's total work hours</p>
        <p className="amount">{`${totalTime}min`}</p>
        <div className="summary">
          <div className="item">
            <div className="itemTitle">Yesterday</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">12.4hrs</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Week</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">12.4hrs</div>
            </div>
          </div>
          <div className="item">
            <div className="itemTitle">Last Month</div>
            <div className="itemResult positive">
              <KeyboardArrowUpOutlinedIcon fontSize="small" />
              <div className="resultAmount">12.4hrs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Featured;
