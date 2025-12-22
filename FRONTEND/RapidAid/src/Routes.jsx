import { createBrowserRouter } from "react-router-dom";
import UserLayout from "./Layouts/UserLayout";

import Homepage from "./pages/Hompage";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Incidents from "./Pages/Incidents";

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
    path:"register",
    element: <Register />,
  },
  {
    path:"/incidents",
    element:<Incidents/>
  },
]);

export default router;