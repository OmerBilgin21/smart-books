import React from "react";
import BookSvg from "@assets/book.svg";
import Button from "./Button";
import { useNavigate } from "react-router";

type Props = {};

const Navbar: React.FC<Props> = ({}: Props) => {
  const navigate = useNavigate();
  return (
    <div class="bg-brand w-screen h-10 sticky flex justify-between px-2 items-center">
      <Button
        onClick={() => {
          navigate("/");
        }}
        children={<img src={BookSvg} alt="book-logo" class="h-10 w-10 mx-5" />}
      />

      <div class="cent border border-black w-max">
        <Button
          onClick={() => {
            navigate("home");
          }}
          children="Home"
        />
      </div>
    </div>
  );
};

export default Navbar;
