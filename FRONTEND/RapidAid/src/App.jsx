import { RouterProvider } from "react-router-dom";
import router from "./Routes";// your router page

export default function App() {
  return <RouterProvider router={router} />;
}
