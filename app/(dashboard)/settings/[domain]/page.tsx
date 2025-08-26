/**
 * Domain Settings Page with Static Generation
 *
 * This page uses generateStaticParams to pre-render all domain settings pages
 * at build time, improving performance and user experience.
 *
 * Benefits:
 * - Instant page loads for all domain settings
 * - Better SEO and search engine crawling
 * - Reduced server load
 * - Improved caching
 *
 * The page maintains all existing functionality while adding static generation.
 */

import {
  onGetCurrentDomainInfo,
  getAllDomainsForStaticGeneration,
} from "@/actions/settings";
import SettingsForm from "@/components/forms/SignUp/settings/form";
import InfoBars from "@/components/infoBar";
import BotTrainingForm from "@/components/settings/BotTrainingForm";
import { redirect } from "next/navigation";
import React from "react";
import { Metadata } from "next";

type Props = { params: Promise<{ domain: string }> };

// Generate static params for all domains at build time
export async function generateStaticParams() {
  try {
    console.log("🔧 Generating static params for domain settings pages...");

    const allDomains = await getAllDomainsForStaticGeneration();

    console.log(`📊 Found ${allDomains.length} domains for static generation`);

    // Generate static paths for each domain
    const params = allDomains.map((domain) => ({
      domain: domain.name,
    }));

    console.log(
      "✅ Generated static params:",
      params.map((p) => p.domain)
    );

    return params;
  } catch (error) {
    console.error("❌ Error generating static params:", error);
    // Return empty array to prevent build failure
    return [];
  }
}

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
