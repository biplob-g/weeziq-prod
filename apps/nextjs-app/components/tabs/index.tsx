import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

type Props = {
  triggers: {
    label: string;
    icon?: React.ReactElement;
  }[];
  children: React.ReactNode;
  classname: string;
  button?: React.ReactElement;
};

const TabsMenu = ({ triggers, children, classname, button }: Props) => {
  // Validate triggers array and provide fallback
  const defaultTab = triggers && triggers.length > 0 ? triggers[0].label : "";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className={cn("pr-5", classname)}>
        {triggers &&
          triggers.map((trigger, key) => (
            <TabsTrigger
              key={key}
              value={trigger.label}
              className="capitalize flex gap-2 font-semibold"
            >
              {trigger.icon && trigger.icon}
              {trigger.label}
            </TabsTrigger>
          ))}
        {button}
      </TabsList>
      {children}
    </Tabs>
  );
};

export default TabsMenu;
