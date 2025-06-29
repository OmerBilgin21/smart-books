import { createBrowserRouter } from "react-router";
import RootLayout from "./Layout.tsx";
import LandingPage from "@components/LandingPage";
import Notfound from "@components/NotFound";
import HomePage from "@components/HomePage";
import SignUp from "@components/SignUp.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: "landing",
    element: <LandingPage />,
  },
  {
    path: "*",
    element: <Notfound />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
]);
