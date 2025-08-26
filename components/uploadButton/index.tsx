import React, { useState } from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Edit } from "lucide-react";
import { ErrorMessage } from "@hookform/error-message";

type Props = {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  label: string;
};

const UploadButton = ({ register, errors, label }: Props) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSizeError, setFileSizeError] = useState<string>("");

  const { onChange, ...registration } = register("image");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);

      // Check file size (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileSizeError("File size must be less than 2MB");
        setImagePreview(null);
        // Clear the input value to prevent form submission with invalid file
        event.target.value = "";
        return;
      } else {
        setFileSizeError("");
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Call the original onChange from react-hook-form
    onChange(event);
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <Label
          htmlFor="upload-button"
          className="flex gap-2 p-3 rounded-lg bg-gray-300 text-gray-500 cursor-pointer font-semibold text-sm items-center"
        >
          <Input
            {...registration}
            className="hidden"
            type="file"
            id="upload-button"
            accept="image/*"
            onChange={handleImageChange}
          />

          <Edit />
          {label}
        </Label>
        <p className="text-sm text-gray-400 ml-6">
          Recommended size is 300px * 300px, size <br /> less than 2MB
        </p>
      </div>

      {imagePreview && (
        <div className="mt-3 flex items-center gap-3">
          <div className="w-12 h-12 border border-gray-300 rounded overflow-hidden flex-shrink-0">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-700 truncate">{fileName}</span>
        </div>
      )}

      {fileSizeError && (
        <p className="text-red-400 mt-2 text-sm">{fileSizeError}</p>
      )}

      {!fileSizeError && (
        <ErrorMessage
          errors={errors}
          name="image"
          render={({ message }) => {
            return (
              <p className="text-red-400 mt-2">
                {message === "Required" ? "" : message}
              </p>
            );
          }}
        />
      )}
    </>
  );
};

export default UploadButton;
