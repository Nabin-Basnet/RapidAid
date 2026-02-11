import { createBrowserRouter } from "react-router-dom";
import UserLayout from "./Layouts/UserLayout";
import Homepage from "./Pages/Hompage";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Incidents from "./Pages/incidents/Incidents";
import IncidentDetail from "./Pages/incidents/Incidentsdetail";
import Profile from "./Pages/Profile";
import DonationPage from "./Pages/donations/donationPage";
import ReportIncident from "./Pages/incidents/ReportIncidents";
import DonationForm from "./Pages/donations/DonationForm";
import DonerRegister from "./Pages/donations/DonerRegister";
import VolunteerForm from "./Pages/volunteer/VolunteerForm";
// import DonationPage from "./Pages/donations/DonationPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: "/donations",
        element: <DonationPage />,
      },
      {
        path:"/donates",
        element:<DonationForm/>
      },
      {
        path:"/doner",
        element:<DonerRegister/>
      },
      {
        path:"/report",
        element:<ReportIncident/>
      },
      {
        path: "/volunteer/apply/:id",
        element: <VolunteerForm />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "incidents",
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
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export default router;
