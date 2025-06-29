import React, { useEffect } from "react";
import Navbar from "./Components/Navbar";
import { Outlet } from "react-router";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router";

type Props = {};

const RootLayout: React.FC<Props> = ({}: Props) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/landing", { replace: true });
    }
  }, []);

  return (
    <div className="min-h-screen max-w-7xl">
      <nav>
        <Navbar />
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
