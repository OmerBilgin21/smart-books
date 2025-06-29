import React from "react";
import Button from "./Button";
import { useNavigate } from "react-router";

const NotFoun: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div class="w-screen h-screen cent flex-col gap-32 font-bold text-7xl bg-brand">
      Oops! Page not found.
      <Button
        onClick={() => {
          navigate("/");
        }}
        children="Go back home"
      />
    </div>
  );
};

export default NotFoun;
