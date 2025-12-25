import { createBrowserRouter } from "react-router-dom";
import UserLayout from "./Layouts/UserLayout";

import Homepage from "./pages/Hompage";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Incidents from "./Pages/incidents/Incidents";
import IncidentDetail from "./Pages/incidents/Incidentsdetail";
import Profile from "./Pages/Profile";

// import AdminLayout from "./Admin/Layouts/AdminLayout";

const router = createBrowserRouter([
  {
   path: "/",
    element: <UserLayout />,
    children: [
      {
        path: "",
        element: <Homepage />,
      },
      
    ],
  },
  {
    path:"/login",
    element: <Login />,
  },
  {
    path:"/register",
    element: <Register />,
  },
  {
    path:"/profile",
    element:<Profile/>
  },
   {
        path: "incidents/",
        children: [
          {
            index: true,
            element: <Incidents />,
          },
          {
            path: ":id",
            element: <IncidentDetail />,
          },
        ],
      },
]);

export default router;