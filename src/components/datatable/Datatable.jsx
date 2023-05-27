import "./datatable.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns } from "../../datatablesource";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { Link } from "react-router-dom";
import { UserAuth } from "../../context/AuthContext";
import { useEffect, useState, useContext } from "react";

const Datatable = () => {
  const { sear, setSear } = UserAuth();
  const [data, setData] = useState([]);
  const [userData, setUserData] = useState([]);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (q) => {
      const usersData = [];
      q.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        const item = doc.data();
        usersData.push({
          id: doc.id,
          username: item.name,
          email: item.email,
          img: item.photoUrl,
          status: item?.status,
        });
      });
      //console.log(usersData);
      setData(usersData);
      setUserData(usersData);
      // Respond to data
      // ...
    });
    // setSear="";
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    //console.log(data);
    // item.name.toLoweCase().indexOf(sear.toLowerCase())!==-1
    //console.log(sear.toLowerCase());
    //console.log(userData);
    setData(
      userData.filter(
        (item) => item.username.toLowerCase().indexOf(sear.toLowerCase()) !== -1
      )
    );
  }, [sear]);

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <Link
              to={`/users/${params.row.id}`}
              style={{ textDecoration: "none" }}
            >
              <div className="viewButton">View</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatable">
      {/* <div className="datatableTitle">
        Add New User
        <Link to="/users/new" className="link">
          Add New
        </Link>
      </div> */}
      <DataGrid
        className="datagrid"
        rows={data}
        columns={userColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />
    </div>
  );
};

export default Datatable;
