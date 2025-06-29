import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import TextInput from "./TextInput";
import Button, { ButtonVariant } from "./Button";
import HandleFormErrors from "./FormErrorHandler";
import BookShelves from "@assets/bookshelves.jpeg";
import { useAuth } from "@contexts/AuthContext";
import { useNavigate } from "react-router";

type Props = {};

type FormProps = {
  email: string;
  password: string;
};

const Login: React.FC<Props> = ({}: Props) => {
  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm<FormProps>();

  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit: SubmitHandler<FormProps> = async (
    data: FormProps,
  ): Promise<void> => {
    console.log("data: ", data);
    if (data && data.email && data.password) {
      await signIn(data.email, data.password);
    }
  };

  useEffect(() => {
    console.log("isAuthenticated: ", isAuthenticated);
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated]);

  return (
    <div
      className="w-screen h-screen cent relative"
      style={{ backgroundImage: `url(${BookShelves})` }}
    >
      <form
        onSubmit={submitForm(handleSubmit)}
        className="w-full h-full cent text-white"
        style={{ border: "4px solid red" }}
      >
        <div
          className="w-1/2 h-[80%] cent flex-col gap-16 bg-brand-dark rounded-xl"
          style={{ border: "4px solid red" }}
        >
          <TextInput
            label="*Email:"
            register={register}
            required={true}
            fieldName="email"
          />
          <TextInput
            label="*Password:"
            register={register}
            required={true}
            fieldName="password"
            type="password"
          />

          <Button
            type="submit"
            children="Submit"
            onClick={() => {}}
            variant={ButtonVariant.SECONDARY}
          />
        </div>
      </form>

      <HandleFormErrors errors={errors} />
    </div>
  );
};

export default Login;
