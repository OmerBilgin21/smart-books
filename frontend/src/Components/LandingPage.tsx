import { useAuth } from "@contexts/AuthContext";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import Button, { ButtonVariant } from "./Button";
import Hero from "@assets/hero.png";

type Props = {};

const LandingPage: React.FC<Props> = ({}: Props) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("isAuthenticated: ", isAuthenticated);
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated]);

  const features = [
    {
      title: "we",
      icon: "abo",
      description: "yihu",
    },
  ];

  return (
    <div className="h-screen max-w-[1280px]">
      <section className="h-1/3 cent flex bg-gray-50 w-full">
        <div className="w-1/2 cent">
          <img src={Hero} alt="hero-img" className="cent w-[77%] h-auto" />
        </div>
        <div className="cent w-1/2 flex-col gap-16">
          <p className="text-4xl text-center">
            Start enjoying worry-less reading experience! We will handle the
            rest.
          </p>
          <Button
            children="Sign-Up Now"
            onClick={() => {
              navigate("/signup");
            }}
            variant={ButtonVariant.PRIMARY}
          />
        </div>
      </section>
      <section className="h-1/3 bg-brand-dark text-white grid grid-cols-3 gap-8 text-center">
        {features.map((f) => (
          <div key={f.title} className="p-6">
            <div className="mb-4 text-blue-600">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-500">{f.description}</p>
          </div>
        ))}
      </section>
      <section className="h-1/3 bg-brand text-white text-center">
        <Button
          children="Sign-In Now"
          onClick={() => {
            navigate("/signin");
          }}
          variant={ButtonVariant.PRIMARY}
        />
      </section>
    </div>
  );
};

export default LandingPage;
