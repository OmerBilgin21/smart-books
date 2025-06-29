import { useAuth } from "@contexts/AuthContext";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import Button, { ButtonVariant } from "./Button";

type Props = {};

const LandingPage: React.FC<Props> = ({}: Props) => {
  console.log("yo ");
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const asd = async () => {
      await signIn("asd@asd.com", "qwe");
    };

    asd();
  }, []);

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
      <section className="h-1/3 cent flex-col bg-gray-50">
        <p className="text-4xl">brathe</p>
        <Button
          children="Sign-Up Now"
          onClick={() => {
            navigate("/signup");
          }}
          variant={ButtonVariant.PRIMARY}
        />
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
          children="Sign-Up Now"
          onClick={() => {
            navigate("/signup");
          }}
          variant={ButtonVariant.PRIMARY}
        />
      </section>
    </div>
  );
};

export default LandingPage;
