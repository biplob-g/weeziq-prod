import { onGetAllAccountDomains } from "@/actions/auth";
import IntegrationLayout from "@/components/integration/IntegrationLayout";
import React from "react";

const IntegrationPage = async () => {
  const domains = await onGetAllAccountDomains();

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-5 py-2">
        <h1 className="text-2xl font-bold text-foreground">Integration</h1>
        <p className="text-muted-foreground mt-1">
          Connect your external services and tools
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <IntegrationLayout domains={domains?.domains} />
      </div>
    </div>
  );
};

export default IntegrationPage;
