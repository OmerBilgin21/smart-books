import React from "react";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router";

type Props = {};

const RootLayout: React.FC<Props> = ({}: Props) => {
  return (
    <>
      <nav>
        <Navbar />
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default RootLayout;
