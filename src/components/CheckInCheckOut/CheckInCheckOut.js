import * as React from "react";
import { useEffect } from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import "./checkInCheckOut.scss";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import { useParams } from "react-router-dom";

export default function CheckInCheckOut({ selectedDate }) {
  const { userId } = useParams();
  // console.log(selectedDate);
  // const deDate = selectedDate.selectedDate.split("T")[0];

  const options = {
    timeZone: "Asia/Kolkata",
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  };
  const deDate = selectedDate.toLocaleDateString("en-US", options).split("/");
  const id = `${deDate[2]}-${deDate[0]}-${deDate[1]}`;
  console.log(id);
  const docRef = doc(db, "attendence", id);
  console.log(userId);
  const [data, setData] = React.useState([]);
  // Get a document, forcing the SDK to fetch from the offline cache.
  useEffect(() => {
    const unsub = onSnapshot(docRef, (doc) => {
      const obj = doc.data();
      const x = [];
      if (obj) {
        Object.keys(obj).forEach((key) => {
          if (obj[key]?.email === userId) {
            x.push({
              CheckIn: obj[key].checkInTime,
              CheckOut: obj[key].checkOutTime,
            });

            //   console.log(
            //     (new Date([
            //       "2023-04-28",
            //       obj[key].checkOutTime === "nil"
            //         ? "24:00:00"
            //         : obj[key].checkOutTime,
            //     ]) -
            //       new Date(["2023-04-28", obj[key].checkInTime])) /
            //       60000
            //   );
            // console.log("Current data: ", obj[key]);
          }
        });
      }
      setData(x);
    });
    return () => unsub();
  }, [selectedDate]);

  console.log(data);

  return (
    <Timeline position="alternate">
      {data.map((time) => {
        return (
          <>
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                {time.CheckIn}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>Check In</TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                {time.CheckOut}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>Check Out</TimelineContent>
            </TimelineItem>
          </>
        );
      })}
    </Timeline>
  );
}
