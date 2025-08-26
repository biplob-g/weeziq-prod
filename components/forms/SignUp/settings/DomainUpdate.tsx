import React from "react";
import FormGenerator from "../formGenerator";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

type Props = {
  name: string;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
};

export const DomainUpdate = ({ name, register, errors }: Props) => {
  return (
    <div className="flex justify-start gap-2 items-start w-[400px] ">
      <FormGenerator
        label="Domain name"
        register={register}
        name="domain"
        errors={errors}
        type="text"
        inputType="input"
        placeholder={name}
      />
    </div>
  );
};

export default DomainUpdate;
