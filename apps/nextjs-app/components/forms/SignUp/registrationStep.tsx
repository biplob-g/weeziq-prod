"use client";

import { useAuthContextHook } from "@/context/useAuthContext";
import React, { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import dynamic from "next/dynamic";
import { Loader as LoaderIcon } from "lucide-react";

const DetailForm = dynamic(() => import("./accountDetailsForm"), {
  ssr: false,
  loading: () => (
    <div className="w-full py-5 flex justify-center">
      <LoaderIcon className="h-8 w-8 animate-spin text-[#722594]" />
    </div>
  ),
});

const OTPForm = dynamic(() => import("./otpForm"), {
  ssr: false,
  loading: () => (
    <div className="w-full py-5 flex justify-center">
      <LoaderIcon className="h-8 w-8 animate-spin text-[#722594]" />
    </div>
  ),
});

const RegistrationFormStep = () => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext();
  const { currentStep } = useAuthContextHook();
  const [onOTP, setOnOTP] = useState<string>("");

  // ✅ NEW: Watch password fields for real-time validation
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const email = watch("email");
  const confirmEmail = watch("confirmEmail");

  // ✅ NEW: Real-time validation
  useEffect(() => {
    if (password && confirmPassword) {
      trigger("confirmPassword");
    }
    if (email && confirmEmail) {
      trigger("confirmEmail");
    }
  }, [password, confirmPassword, email, confirmEmail, trigger]);

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
