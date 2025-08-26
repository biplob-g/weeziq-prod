"use client";

import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/hooks/settings/useSettings";
import React from "react";
import DomainUpdate from "./DomainUpdate";
import CodeSnippet from "./CodeSnippet";
import { Crown } from "lucide-react";
import EditChatbotIcon from "./EditChatbotIcon";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/loader";

const Welcomemessage = dynamic(
  () => import("./greetingsMessage").then((props) => props.default),
  {
    ssr: false,
  }
);

type Props = {
  id: string;
  name: string;
  plan?: "STANDARD" | "PRO" | "ULTIMATE";
  chatBot: {
    id: string;
    icon: string | null;
    welcomeMessage: string | null;
  } | null;
};

const SettingsForm = ({ id, name, chatBot }: Props) => {
  const {
    register,
    onUpdateSettings,
    errors,
    loading,
    onDeleteDomain,
    deleting,
  } = useSettings(id);

  return (
    <form
      className="flex flex-col gap-8 pb-18 px-10"
      onSubmit={onUpdateSettings}
    >
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-2xl"> Domain Settings</h2>
        <Separator orientation="horizontal" />
        <DomainUpdate name={name} register={register} errors={errors} />
        <CodeSnippet id={id} />
      </div>
      <div className="flex flex-col gap-3 mt-5">
        <div className="flex gap-4 items-center">
          <h2 className="font-bold text-2xl">ChatBot Settings</h2>
          <div className="flex gap-1 bg-gray-200 rounded-full px-3 py-1 text-xs items-center font-bold">
            <Crown />
            Premium
          </div>
        </div>
        <Separator orientation="horizontal" />
        <div className="grid md:grid-cols-2">
          <div className="col-span-1 flex flex-col gap-5 order-last md:order-first">
            <EditChatbotIcon
              chatBot={chatBot}
              register={register}
              errors={errors}
            />

            <Welcomemessage
              message={chatBot?.welcomeMessage || ""}
              register={register}
              errors={errors}
            />
          </div>
          <div className="col-span-1 relative">
            <Image
              alt="Bot Ui"
              src="/images/app-ui.png"
              className="sticky top-0"
              width={530}
              height={770}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-5 justify-end">
        <Button
          className="px-10 g-[50px] cursor-pointer"
          variant="destructive"
          type="button"
          onClick={onDeleteDomain}
        >
          <Loader loading={deleting}>Delete Domain</Loader>
        </Button>
        <Button type="submit" className="w-[100px] h-[35px] cursor-pointer">
          <Loader loading={loading}>Save</Loader>
        </Button>
      </div>
    </form>
  );
};

export default SettingsForm;
