import { render } from "preact";
import { RouterProvider } from "react-router";
import { router } from "./router.tsx";
import "./index.css";
import AuthContextProvider from "@contexts/AuthProvider.tsx";
import { ToastContainer } from "react-toastify";

render(
  <AuthContextProvider>
    <ToastContainer />
    <RouterProvider router={router} />
  </AuthContextProvider>,
  document.getElementById("app")!,
);
