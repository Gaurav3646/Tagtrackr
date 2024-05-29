import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  redirect,
  unstable_HistoryRouter,
  useNavigate,
} from "react-router-dom";
import { productInputs, userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { UserAuth } from "./context/AuthContext";
import Maparea from "./pages/maparea/Maparea";
import PremisesDetailsPage from "./pages/maparea/PremisesDetail";
import Profile from "./components/Profile/Profile";

const Protected = ({ children }) => {
  const { currentUser } = UserAuth();
  if (!currentUser) {
    return <Navigate replace={true} to="/login" />;
  }

  return children;
};

function App() {
  const { darkMode } = useContext(DarkModeContext);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route
              index
              element={
                <Protected>
                  <Home />
                </Protected>
              }
            />
            <Route path="profile" element={<Profile />} />
            <Route path="create-premises" element={<Maparea />} />
            <Route path="premises-details" element={<PremisesDetailsPage />} />
            <Route path="login" element={<Login />} />
            <Route path="users">
              <Route
                index
                element={
                  <Protected>
                    <List />
                  </Protected>
                }
              />
              <Route
                path=":userId"
                element={
                  <Protected>
                    <Single />
                  </Protected>
                }
              />
              <Route
                path="new"
                element={<New inputs={userInputs} title="Add New User" />}
              />
            </Route>
            <Route path="groups">
              <Route index element={<Maparea />} />
              <Route path=":groupId" element={<PremisesDetailsPage />} />
              {/* <Route
                path="new"
                element={<New inputs={productInputs} title="Add New Product" />}
              /> */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
