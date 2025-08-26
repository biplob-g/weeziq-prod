/**

* Domain Settings Page - Dynamic Rendering
 *
 * This page uses dynamic rendering to handle user-specific domain settings
 * with proper authentication and real-time data.
 */

import { onGetCurrentDomainInfo } from "@/actions/settings";
import SettingsForm from "@/components/forms/SignUp/settings/form";
import InfoBars from "@/components/infoBar";
import BotTrainingForm from "@/components/settings/BotTrainingForm";
import { redirect } from "next/navigation";
import React from "react";
import { Metadata } from "next";

// Force dynamic rendering for this page
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ domain: string }> };

// Generate metadata for each domain page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const domain = await onGetCurrentDomainInfo(resolvedParams.domain);

    if (!domain || !domain.domains || domain.domains.length === 0) {
      return {
        title: "Domain Settings - WeezGen",
        description: "Manage your chatbot domain settings",
      };
    }

    const currentDomain = domain.domains[0];

    return {
      title: `${currentDomain.name} Settings - WeezGen`,
      description: `Manage settings and configuration for ${currentDomain.name} chatbot`,
      openGraph: {
        title: `${currentDomain.name} Settings`,
        description: `Configure your ${currentDomain.name} chatbot settings`,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Domain Settings - WeezGen",
      description: "Manage your chatbot domain settings",
    };
  }
}

const DomainSettingsPage = async ({ params }: Props) => {
  const resolvedParams = await params;
  const domain = await onGetCurrentDomainInfo(resolvedParams.domain);

  // Add debugging
  console.log("Domain result:", domain);

  // More comprehensive null checks
  if (!domain) {
    console.log("No domain data returned");
    redirect("/dashboard");
  }

  if (!domain.domains || domain.domains.length === 0) {
    console.log("No domains found in result");
    redirect("/dashboard");
  }

  const currentDomain = domain.domains[0];

  // Additional check for currentDomain
  if (!currentDomain) {
    console.log("Current domain is null/undefined");
    redirect("/dashboard");
  }

  return (
    <>
      <InfoBars />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        <SettingsForm
          plan={
            domain.subscription?.plan === "STARTER"
              ? "STANDARD"
              : domain.subscription?.plan === "GROWTH"
              ? "PRO"
              : domain.subscription?.plan === "PRO"
              ? "ULTIMATE"
              : undefined
          }
          chatBot={currentDomain.chatBot}
          id={currentDomain.id}
          name={currentDomain.name}
        />
        <BotTrainingForm id={domain.domains[0].id} />
      </div>
    </>
  );
};

export default DomainSettingsPage;
