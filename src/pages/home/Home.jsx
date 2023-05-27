import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import Table from "../../components/table/Table";
import { useEffect } from "react";
import { useState } from "react";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { UserAuth } from "../../context/AuthContext";

const Home = () => {
  const options = {
    timeZone: "Asia/Kolkata",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  };
  const tempData = [];
  const { startDate } = UserAuth();
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
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="widgets">
          <Widget type="user" />
          <Widget type="order" />
          <Widget type="earning" />
          <Widget type="balance" />
        </div>
        <div className="charts">
          <Featured />
          <Chart title="Last 6 Days (Work Hours)" aspect={2 / 1} data={data} />
        </div>
        <div className="listContainer">
          <div className="listTitle">Latest Transactions</div>
          <Table />
        </div>
      </div>
    </div>
  );
};

export default Home;
