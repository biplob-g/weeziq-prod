import React, { useEffect } from "react";
import { FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";

type Props = {
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>; // ✅ NEW: Add setValue prop
  domains?:
    | {
        name: string;
        id: string;
        icon: string;
      }[]
    | undefined;
};

const ConversationSearch = ({ register, setValue, domains }: Props) => {
  // ✅ NEW: Auto-select first domain when component mounts
  useEffect(() => {
    if (domains && domains.length > 0) {
      setValue("domain", domains[0].id);
    }
  }, [domains, setValue]);

  return (
    <div className="flex flex-col py-3">
      <select
        {...register("domain")}
        className="px-3 py-4 text-sm border-[1px] rounded-lg mr-5"
        defaultValue=""
      >
        <option disabled value="">
          {domains && domains.length > 0
            ? "Select Domain"
            : "No domains available"}
        </option>
        {domains?.map((domain) => (
          <option value={domain.id} key={domain.id}>
            {domain.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ConversationSearch;
