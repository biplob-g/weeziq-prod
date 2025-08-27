"use client";

import React from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import UserTypeCard from "./userTypeCard";

type Props = {
  register: UseFormRegister<FieldValues>;
  userType: "owner" | "student";
  setUserType: React.Dispatch<React.SetStateAction<"owner" | "student">>;
};

const TypeSelectionForm = ({ register, setUserType, userType }: Props) => {
  return (
    <>
      <h2 className="text-gravel md:text-4xl font-bold">Create an Account</h2>
      <p className="text-iridium md:text-sm">
        Tell us about yourself! What do you do? Let&apos;s tailor your <br />
        experience so it best suits you.
      </p>
      <UserTypeCard
        register={register}
        setUserType={setUserType}
        userType={userType}
        value="owner"
        title="I own a Business"
        text="Setting up my account for my company"
      />
      <UserTypeCard
        register={register}
        setUserType={setUserType}
        userType={userType}
        value="student"
        title="I'm a student"
        text="Looking to Learn more about the tool"
      />
    </>
  );
};

export default TypeSelectionForm;
