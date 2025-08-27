import { onGetAllAccountDomains } from "@/actions/auth";
import LeadsLayout from "@/components/leads/LeadsLayout";
import React from "react";

const LeadsPage = async () => {
  const domains = await onGetAllAccountDomains();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-5 py-2">
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <p className="text-muted-foreground mt-1">
          Manage and view all your customer leads from chat conversations
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <LeadsLayout domains={domains?.domains} />
      </div>
    </div>
  );
};

export default LeadsPage;
