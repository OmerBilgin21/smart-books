import React from "react";
import type { ComponentChildren } from "preact";

export enum ButtonVariant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

type Props = {
  onClick?: () => void;
  children: ComponentChildren;
  variant?: ButtonVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<Props> = ({
  onClick,
  children,
  variant = ButtonVariant.PRIMARY,
  class: inheritedClass,
  className,
  ...rest
}: Props) => {
  const theme = {
    [ButtonVariant.PRIMARY]:
      "bg-brand-dark text-white hover:bg-brand hover:text-brand-dark",
    [ButtonVariant.SECONDARY]:
      "bg-brand text-black hover:bg-brand-dark hover:text-brand",
  };

  return (
    <button
      class={`
animate w-max h-max rounded-lg text-md font-semibold px-2 py-1.5
hover:mx-0.5 hover:cursor-pointer
${typeof children === "string" && theme[variant]}
${inheritedClass && inheritedClass}
${className && className}
`}
      onClick={onClick}
      key={(Math.random() * 10).toString()}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
