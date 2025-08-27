import { HELP_DESK_TABS_MENU } from "@/constants/menu";
import React from "react";
import { TabsContent } from "../ui/tabs";
import HelpDesk from "./HelpDesk";
import TaskSummary from "./TaskSummary";
import TabsMenu from "../tabs";

type Props = {
  id: string;
};

const BotTrainingForm = ({ id }: Props) => {
  return (
    <>
      <div className="px-10 py-5 mb-10 flex flex-col gap-5 items-start">
        <div className="flex flex-col gap-2">
          <h2 className="font-bold text-2xl">Bot Training</h2>
          <p className="text-sm font-light">
            Set FAQ questions, create questions for capturing lead information
            and train your bot to act the way you want it to.
          </p>
        </div>
        <TabsMenu classname="px-2" triggers={HELP_DESK_TABS_MENU}>
          <TabsContent value="help desk" className="w-full">
            <HelpDesk id={id} />
          </TabsContent>
          <TabsContent value="task summary">
            <TaskSummary id={id} />
          </TabsContent>
        </TabsMenu>
      </div>
    </>
  );
};

export default BotTrainingForm;
