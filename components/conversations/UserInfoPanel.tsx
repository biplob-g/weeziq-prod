"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  Eye,
  Activity,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { SelectedConversation } from "./ConversationLayout";
import { onGetCustomerInfo } from "@/actions/conversation";
import { detectCountryFromIP } from "@/lib/countryCodes";
import CountryFlag from "../chatbot/CountryFlag";
import {
  getStoredPageVisits,
  getMockPageVisits,
  PageVisit,
} from "@/lib/pageTracking";

type Props = {
  selectedConversation: SelectedConversation | null;
  onClose?: () => void;
};

interface CustomerDetails {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  countryCode: string | null;
  ipAddress: string | null;
  createdAt: Date;
  domainId: string | null;
  lastActiveAt?: Date;
  isOnline?: boolean;
  hasUnreadMessages?: boolean;
  chatRoom?: {
    id: string;
    createdAt: Date;
    live: boolean;
    message: {
      id: string;
      message: string;
      role: string;
      createdAt: Date;
      seen: boolean;
    }[];
  }[];
}

interface LocationInfo {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
}

// Accordion section component
const AccordionSection = ({
  title,
  icon,
  children,
  isOpen = false,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle: () => void;
}) => {
  return (
    <Card>
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {isOpen && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
};

const UserInfoPanel = ({ selectedConversation, onClose }: Props) => {
  const [customerDetails, setCustomerDetails] =
    useState<CustomerDetails | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [visitedPages, setVisitedPages] = useState<PageVisit[]>([]);
  const [loading, setLoading] = useState(false);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    customerInfo: true,
    location: true,
    visitedPages: false,
    additionalInfo: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Generate avatar from customer name
  const getAvatarInitials = (name: string | null | undefined): string => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Detect location from IP
  const detectLocationFromIP = async (ipAddress: string) => {
    try {
      // First try to get country from IP
      const country = await detectCountryFromIP();
      if (country) {
        setLocationInfo({
          country: country.name,
          countryCode: country.code,
        });
      }

      // Try to get more detailed location info
      try {
        const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        if (response.ok) {
          const data = await response.json();
          setLocationInfo({
            country: data.country_name || country?.name || "Unknown",
            countryCode: data.country_code || country?.code || "US",
            city: data.city,
            region: data.region,
          });
        }
      } catch (error) {
        console.warn("Failed to get detailed location info:", error);
      }
    } catch (error) {
      console.error("Failed to detect location:", error);
    }
  };

  // Get visited pages from localStorage or use mock data for development
  const getVisitedPages = (): PageVisit[] => {
    // Try to get real page visits from localStorage
    const storedVisits = getStoredPageVisits();

    // If no stored visits, use mock data for development
    if (storedVisits.length === 0) {
      return getMockPageVisits();
    }

    return storedVisits;
  };

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!selectedConversation) {
        setCustomerDetails(null);
        setLocationInfo(null);
        setVisitedPages([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch customer details
        const info = await onGetCustomerInfo(selectedConversation.customerId);
        if (info) {
          // Fix type compatibility for chatRoom messages
          const processedInfo = {
            ...info,
            chatRoom: info.chatRoom?.map((room) => ({
              ...room,
              message: room.message.map((msg) => ({
                ...msg,
                role: msg.role || "CUSTOMER",
              })),
            })),
          };
          setCustomerDetails(processedInfo);

          // Detect location if IP address is available
          if (info.ipAddress) {
            await detectLocationFromIP(info.ipAddress);
          }

          // Get visited pages
          const pages = getVisitedPages();
          setVisitedPages(pages);
        }
      } catch (error) {
        console.error("Error fetching customer details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();

    // Set up polling for real-time updates every 30 seconds
    const interval = setInterval(fetchCustomerDetails, 30000);

    return () => clearInterval(interval);
  }, [selectedConversation]);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!selectedConversation) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-3 p-6">
          <div className="text-4xl">👤</div>
          <h3 className="text-lg font-medium text-muted-foreground">
            Customer Info
          </h3>
          <p className="text-sm text-muted-foreground">
            Select a conversation to view customer details
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">
            Loading customer info...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Customer Info</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-muted"
            title="Close panel"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {/* Customer Profile - Accordion */}
        <AccordionSection
          title="Customer Info"
          icon={<User className="h-4 w-4" />}
          isOpen={openSections.customerInfo}
          onToggle={() => toggleSection("customerInfo")}
        >
          <div className="space-y-3">
            {/* Avatar and basic info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                  {getAvatarInitials(customerDetails?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {customerDetails?.name || "Unknown Customer"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Customer since{" "}
                  {customerDetails?.createdAt
                    ? new Date(customerDetails.createdAt).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {customerDetails?.email || "Not provided"}
                </p>
              </div>
            </div>

            {/* Phone */}
            {customerDetails?.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    {customerDetails.countryCode} {customerDetails.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Customer ID */}
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Customer ID</p>
                <Badge variant="outline" className="text-xs">
                  {customerDetails?.id}
                </Badge>
              </div>
            </div>
          </div>
        </AccordionSection>

        {/* Location Information - Accordion */}
        {locationInfo && (
          <AccordionSection
            title="Location"
            icon={<MapPin className="h-4 w-4" />}
            isOpen={openSections.location}
            onToggle={() => toggleSection("location")}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 flex items-center gap-2">
                  <CountryFlag
                    countryCode={locationInfo.countryCode}
                    size={16}
                  />
                  <span className="text-sm">{locationInfo.country}</span>
                </div>
              </div>

              {locationInfo.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">
                      {locationInfo.city}
                      {locationInfo.region && `, ${locationInfo.region}`}
                    </p>
                  </div>
                </div>
              )}

              {customerDetails?.ipAddress && (
                <div className="text-xs text-muted-foreground">
                  IP: {customerDetails.ipAddress}
                </div>
              )}
            </div>
          </AccordionSection>
        )}

        {/* Visited Pages - Accordion */}
        <AccordionSection
          title="Visited Pages"
          icon={<Eye className="h-4 w-4" />}
          isOpen={openSections.visitedPages}
          onToggle={() => toggleSection("visitedPages")}
        >
          {visitedPages.length > 0 ? (
            <div className="space-y-3">
              {visitedPages.map((page, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {page.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {page.url}
                      </p>
                    </div>
                    <div className="flex flex-col items-end text-xs text-muted-foreground ml-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(page.visitedAt)}
                      </div>
                      {page.duration && (
                        <div className="flex items-center gap-1 mt-1">
                          <Activity className="h-3 w-3" />
                          {formatDuration(page.duration)}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < visitedPages.length - 1 && (
                    <Separator className="mt-2" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No page visits recorded
            </p>
          )}
        </AccordionSection>

        {/* Additional Info - Accordion */}
        <AccordionSection
          title="Additional Info"
          icon={<Activity className="h-4 w-4" />}
          isOpen={openSections.additionalInfo}
          onToggle={() => toggleSection("additionalInfo")}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">First visit:</span>
              <span>
                {customerDetails?.createdAt
                  ? formatTimeAgo(new Date(customerDetails.createdAt))
                  : "Unknown"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Badge
                variant={customerDetails?.isOnline ? "default" : "secondary"}
                className="text-xs"
              >
                {customerDetails?.isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last active:</span>
              <span>
                {customerDetails?.lastActiveAt
                  ? formatTimeAgo(new Date(customerDetails.lastActiveAt))
                  : "Unknown"}
              </span>
            </div>
            {customerDetails?.hasUnreadMessages && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Messages:</span>
                <Badge variant="destructive" className="text-xs">
                  Unread
                </Badge>
              </div>
            )}
          </div>
        </AccordionSection>
      </div>
    </div>
  );
};

export default UserInfoPanel;
