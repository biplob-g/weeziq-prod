"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserInfoFormProps,
  UserInfoFormSchema,
} from "@/schemas/coversation.schema";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  countryCodes,
  detectCountryFromIP,
  CountryCode,
  findCountryByDialCode,
  findCountryByCode,
} from "@/lib/countryCodes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { User, Mail, Phone, Globe } from "lucide-react";
import CountryFlag from "./CountryFlag";

interface UserInfoFormComponentProps {
  onSubmit: (data: UserInfoFormProps) => void;
  loading?: boolean;
}

const UserInfoForm: React.FC<UserInfoFormComponentProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [detectedCountry, setDetectedCountry] = useState<CountryCode | null>(
    null
  );
  const [isDetecting, setIsDetecting] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserInfoFormProps>({
    resolver: zodResolver(UserInfoFormSchema),
    defaultValues: {
      countryCode: "+1",
    },
  });

  const selectedCountryCode = watch("countryCode");

  useEffect(() => {
    const detectCountry = async () => {
      try {
        const country = await detectCountryFromIP();
        if (country) {
          setDetectedCountry(country);
          setValue("countryCode", country.dialCode);
        }
      } catch (error) {
        console.error("Error detecting country:", error);
      } finally {
        setIsDetecting(false);
      }
    };

    detectCountry();
  }, [setValue]);

  const handleFormSubmit = (data: UserInfoFormProps) => {
    onSubmit(data);
  };

  // Get current selected country for display
  const getCurrentCountry = () => {
    // First try to find by dial code
    const countryByDialCode = findCountryByDialCode(selectedCountryCode);
    if (countryByDialCode) {
      return countryByDialCode;
    }

    // If not found by dial code, use detected country
    if (detectedCountry) {
      return detectedCountry;
    }

    // Fallback to US
    return findCountryByCode("US");
  };

  const currentCountry = getCurrentCountry();

  // Handle country selection - convert country code to dial code
  const handleCountryChange = (countryCode: string) => {
    const country = findCountryByCode(countryCode);
    if (country) {
      setValue("countryCode", country.dialCode);
    }
  };

  // Get the current country code for the select value
  const getCurrentCountryCode = () => {
    if (currentCountry) {
      return currentCountry.code;
    }
    return "US"; // Default fallback
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold text-gray-800">
          Welcome! 👋
        </CardTitle>
        <CardDescription className="text-gray-600">
          Please provide your information to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              <User className="inline w-4 h-4 mr-2" />
              Full Name *
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter your full name"
              className={`w-full ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              <Mail className="inline w-4 h-4 mr-2" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter your email address"
              className={`w-full ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-sm font-medium text-gray-700"
            >
              <Phone className="inline w-4 h-4 mr-2" />
              Phone Number (Optional)
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <Select
                  value={getCurrentCountryCode()}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger className="w-auto h-auto p-0 border-0 bg-transparent hover:bg-transparent focus:ring-0">
                    <SelectValue>
                      {isDetecting ? (
                        <span className="flex items-center gap-1 text-gray-400">
                          <Globe className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          {currentCountry ? (
                            <CountryFlag
                              countryCode={currentCountry.code}
                              size={16}
                              title={currentCountry.name}
                            />
                          ) : (
                            <CountryFlag
                              countryCode="US"
                              size={16}
                              title="United States"
                            />
                          )}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countryCodes.map((country: CountryCode, index: number) => (
                      <SelectItem
                        key={`${country.code}-${index}`}
                        value={country.code}
                      >
                        <span className="flex items-center gap-3">
                          <CountryFlag
                            countryCode={country.code}
                            size={20}
                            title={country.name}
                          />
                          <span className="font-medium">
                            {country.dialCode}
                          </span>
                          <span className="text-gray-500 text-sm">
                            ({country.name})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder={`${selectedCountryCode} Enter phone number`}
                className="pl-12 w-full"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            disabled={loading}
          >
            {loading ? "Starting Chat..." : "Start Chat"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserInfoForm;
