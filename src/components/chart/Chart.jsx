// import "./chart.scss";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const data = [
//   { name: "January", Total: 1200 },
//   { name: "February", Total: 2100 },
//   { name: "March", Total: 800 },
//   { name: "April", Total: 1600 },
//   { name: "May", Total: 900 },
//   { name: "June", Total: 1700 },
// ];

// const Chart = ({ aspect, title }) => {
//   return (
//     <div className="chart">
//       <div className="title">{title}</div>
//       <ResponsiveContainer width="100%" aspect={aspect}>
//         <AreaChart
//           width={730}
//           height={250}
//           data={data}
//           margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//         >
//           <defs>
//             <linearGradient id="total" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
//               <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
//             </linearGradient>
//           </defs>
//           <XAxis dataKey="name" stroke="gray" />
//           <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
//           <Tooltip />
//           <Area
//             type="monotone"
//             dataKey="Total"
//             stroke="#8884d8"
//             fillOpacity={1}
//             fill="url(#total)"
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default Chart;
import "./chart.scss";
import { doc, getDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect } from "react";
import { useState } from "react";
import { db } from "../../firebase";
import { useParams } from "react-router-dom";

const tempData = [
  { name: "Mon", Total: 1200 },
  { name: "Tue", Total: 2100 },
  { name: "Wed", Total: 800 },
  { name: "Thu", Total: 1600 },
  { name: "Fri", Total: 900 },
  { name: "Sat", Total: 1700 },
  { name: "Sun", Total: 1700 },
];

const Chart = ({ aspect, title }) => {
  // const [data, setData] = useState();
  // const { userId } = useParams();
  // const docRef = doc(db, "attendence", "2023-04-28");
  // console.log(userId);
  // // Get a document, forcing the SDK to fetch from the offline cache.
  // useEffect(() => {
  //   const unsub = onSnapshot(docRef, (doc) => {
  //     const obj = doc.data();
  //     Object.keys(obj).forEach((key) => {
  //       console.log(
  //         (new Date([
  //           "2023-04-28",
  //           obj[key].checkOutTime === "nil"
  //             ? "24:00:00"
  //             : obj[key].checkOutTime,
  //         ]) -
  //           new Date(["2023-04-28", obj[key].checkInTime])) /
  //           60000
  //       );
  //       // console.log("Current data: ", obj[key]);
  //     });
  //   });
  //   return () => unsub();
  // }, []);

  return (
    <div className="chart">
      <div className="title">{title}</div>
      <ResponsiveContainer width="100%" aspect={aspect}>
        <BarChart
          width={730}
          height={250}
          data={tempData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
          <XAxis dataKey="name" stroke="gray" />

          <Tooltip />
          <Bar dataKey="Total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
