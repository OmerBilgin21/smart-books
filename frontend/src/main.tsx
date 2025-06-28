import { render } from "preact";
import { RouterProvider } from "react-router";
import { router } from "./router.tsx";
import "./index.css";

render(<RouterProvider router={router} />, document.getElementById("app")!);
