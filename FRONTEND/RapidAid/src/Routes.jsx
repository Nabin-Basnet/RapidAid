import { createBrowserRouter } from "react-router-dom";
import UserLayout from "./Layouts/UserLayout";
import Homepage from "./Pages/Hompage";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import Incidents from "./Pages/incidents/Incidents";
import IncidentDetail from "./Pages/incidents/Incidentsdetail";
import Profile from "./Pages/Profile";
import DonationPage from "./Pages/donations/DonationPage";
import ReportIncident from "./Pages/incidents/ReportIncidents";
import DonationForm from "./Pages/donations/DonationForm";
import DonerRegister from "./Pages/donations/DonerRegister";
import VolunteerForm from "./Pages/volunteer/VolunteerForm";
import Transparency from "./Pages/Transparency";
import AdminLayout from "./Layouts/AdminLayout";
import AdminLanding from "./Pages/Admin/AdminLanding";
import AdminIncidents from "./Pages/Admin/AdminIncidents";
import AdminVolunteers from "./Pages/Admin/AdminVolunteers";
import AdminDonations from "./Pages/Admin/AdminDonations";
import AdminUsers from "./Pages/Admin/AdminUsers";
import AdminCreateUser from "./Pages/Admin/AdminCreateUser";
import RescueDashboard from "./Pages/rescue/RescueDashboard";
import AssessmentDashboard from "./Pages/assessments/AssessmentDashboard";
import LedgerPage from "./Pages/ledger/LedgerPage";
import EditProfile from "./Pages/profile/EditProfile";
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
        path: "/transparency",
        element: <Transparency />,
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
        path: "profile/edit",
        element: <EditProfile />,
      },
      {
        path: "/rescue",
        element: <RescueDashboard />,
      },
      {
        path: "/assessments",
        element: <AssessmentDashboard />,
      },
      {
        path: "/ledger",
        element: <LedgerPage />,
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
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminLanding />,
      },
      {
        path: "incidents",
        element: <AdminIncidents />,
      },
      {
        path: "volunteers",
        element: <AdminVolunteers />,
      },
      {
        path: "donations",
        element: <AdminDonations />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
      {
        path: "create-user",
        element: <AdminCreateUser />,
      },
      {
        path: "rescue",
        element: <RescueDashboard />,
      },
      {
        path: "assessments",
        element: <AssessmentDashboard />,
      },
      {
        path: "ledger",
        element: <LedgerPage />,
      },
    ],
  },
]);

export default router;
