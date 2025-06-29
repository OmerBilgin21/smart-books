import React from "react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  fieldName: Path<T>;
  required: boolean;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const TextInput = <T extends FieldValues>({
  label,
  register,
  fieldName,
  required,
  ...rest
}: Props<T>) => {
  return (
    <div className="cent flex-col gap-1">
      <label for={`${fieldName}-input`}>{label}</label>

      <input
        id={`${fieldName}-input`}
        {...(register && register(fieldName, { required }))}
        {...rest}
        className="bg-brand text-white rounded-full"
      />
    </div>
  );
};

export default TextInput;
