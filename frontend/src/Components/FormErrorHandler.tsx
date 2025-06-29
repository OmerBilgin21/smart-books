import { useEffect } from "react";
import { FieldErrors, FieldValues } from "react-hook-form";
import { toast } from "react-toastify";

type Props<T extends FieldValues> = {
  manualTrigger?: boolean;
  errors?: FieldErrors<T>;
};

const HandleFormErrors = <T extends FieldValues>({
  errors,
  manualTrigger,
}: Props<T>) => {
  const errorsChanged =
    typeof errors === "object" && Object.keys(errors).length;

  useEffect(() => {
    if (!errors) return;
    console.log("errors: ", errors);

    for (const [key, value] of Object.entries(errors)) {
      if (value?.type === "required") {
        toast("There are required fields that are not filled!", {
          theme: "colored",
          type: "warning",
        });
      } else if (value?.message) {
        toast(`${key}: ${value.message}`, { theme: "colored", type: "error" });
      } else {
        toast(
          "An error occured during form submission, please check your information.",
          { theme: "colored", type: "error" },
        );
      }
    }
  }, [errors, errorsChanged, manualTrigger]);

  return null;
};

export default HandleFormErrors;
