import type { ComponentChildren } from "preact";
import React from "react";

export enum ButtonVariant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

type Props = {
  onClick?: () => void;
  text: ComponentChildren;
  variant?: ButtonVariant;
};

const Button: React.FC<Props> = ({
  onClick,
  text,
  variant = ButtonVariant.PRIMARY,
}: Props) => {
  const theme = {
    [ButtonVariant.PRIMARY]:
      "bg-brand-dark text:brand hover:bg-brand hover:text-brand-dark",
    [ButtonVariant.SECONDARY]:
      "bg-brand text-brand-dark hover:bg-brand-dark hover:text-brand",
  };

  return (
    <button
      class={`
animate w-max h-max rounded-lg text-md font-semibold px-1 py-1
hover:mx-0.5 hover:cursor-pointer
${typeof text === "string" && theme[variant]}
`}
      onClick={onClick}
      key={(Math.random() * 10).toString()}
    >
      {text}
    </button>
  );
};

export default Button;
