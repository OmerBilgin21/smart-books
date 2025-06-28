import { createBrowserRouter } from "react-router";
import RootLayout from "./Layout.tsx";
import LandingPage from "@components/LandingPage";
import Notfound from "@components/NotFound";
import HomePage from "@components/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "home",
        element: <HomePage />,
      },
    ],
  },
  {
    path: "*",
    element: <Notfound />,
  },
]);
