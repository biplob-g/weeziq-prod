"use client";

import { useAuthContextHook } from "@/context/useAuthContext";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/spinner";

const DetailForm = dynamic(() => import("./accountDetailsForm"), {
  ssr: false,
  loading: () => <Spinner />,
});

const OTPForm = dynamic(() => import("./otpForm"), {
  ssr: false,
  loading: () => <Spinner />,
});

const RegistrationFormStep = () => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const { currentStep } = useAuthContextHook();
  const [onOTP, setOnOTP] = useState<string>("");
  setValue("otp", onOTP);

  switch (currentStep) {
    case 1:
      return <DetailForm errors={errors} register={register} />;
    case 2:
      return <OTPForm onOTP={onOTP} setOTP={setOnOTP}></OTPForm>;
  }
  return <div>RegistrationFormStep</div>;
};

export default RegistrationFormStep;
