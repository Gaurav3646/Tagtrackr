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
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import { UserAuth } from "../../context/AuthContext";

const Chart = ({ aspect, title, data }) => {
  const { startDate, handlerDate } = UserAuth();
  // const [startDate, setStartDate] = useState(new Date());
  return (
    <div className="chart">
      <div className="title">{title}</div>
      <ReactDatePicker
        selected={startDate}
        onChange={(date) => handlerDate(date)}
      />

      {data.length === 7 && (
        <ResponsiveContainer width="100%" aspect={aspect}>
          <BarChart
            width={730}
            height={250}
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="chartGrid" />
            <XAxis dataKey="name" stroke="gray" />

            <Tooltip />
            <Bar dataKey="Total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default Chart;
