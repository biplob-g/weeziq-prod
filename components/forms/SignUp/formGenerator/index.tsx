import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props<TFieldValues extends FieldValues = FieldValues> = {
  type: "text" | "email" | "password";
  inputType: "select" | "input" | "textarea";
  options?: { value: string; label: string; id: string }[];
  label?: string;
  placeholder: string;
  register: UseFormRegister<TFieldValues>;
  name: string;
  errors: FieldErrors<TFieldValues>;
  lines?: number;
  form?: string;
  defaultValue?: string;
};

const FormGenerator = ({
  errors,
  inputType,
  name,
  placeholder,
  register,
  type,
  form,
  label,
  lines,
  options,
  defaultValue,
}: Props) => {
  switch (inputType) {
    case "input":
      return (
        <Label className="flex flex-col gap-2" htmlFor={`input-${label}`}>
          {label && label}
          <Input
            id={`input-${label}`}
            type={type}
            placeholder={placeholder}
            form={form}
            defaultValue={defaultValue}
            {...register(name)}
          />

          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => {
              return (
                <p className="text-red-400 mt-2">
                  {message === "Required" ? "" : message}
                </p>
              );
            }}
          />
        </Label>
      );

    case "select":
      return (
        <Label htmlFor={`select-${label}`}>
          {label && label}
          <Select form={form} {...register(name)}>
            {options?.length &&
              options.map((option) => (
                <option value={option.value} key={option.id}></option>
              ))}
          </Select>

          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => {
              return (
                <p className="text-red-400 mt-2">
                  {message === "Required" ? "" : message}
                </p>
              );
            }}
          />
        </Label>
      );
    case "textarea":
      return (
        <Label className="flex flex-col gap-2" htmlFor={`input-${label}`}>
          {label && label}
          <Textarea
            id={`input-${label}`}
            placeholder={placeholder}
            form={form}
            {...register(name)}
            rows={lines}
          />

          <ErrorMessage
            errors={errors}
            name={name}
            render={({ message }) => {
              return (
                <p className="text-red-400 mt-2">
                  {message === "Required" ? "" : message}
                </p>
              );
            }}
          />
        </Label>
      );
    default:
      return <></>;
  }
};

export default FormGenerator;
