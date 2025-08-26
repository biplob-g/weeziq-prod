import React from "react";
import {
  LayoutDashboard,
  MailIcon,
  MessageSquare,
  MessageSquareMore,
  Settings,
  Settings2,
  SquareUser,
  TimerIcon,
  UserRoundPen,
  Users,
} from "lucide-react";

type SIDE_BAR_MAIN_PROPS = {
  label: string;
  icon: React.ReactElement;
  path: string;
};

export const SIDE_BAR_MENU: SIDE_BAR_MAIN_PROPS[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard />,
    path: "dashboard",
  },
  {
    label: "Conversation",
    icon: <MessageSquareMore />,
    path: "conversation",
  },
  {
    label: "Leads",
    icon: <Users />,
    path: "leads",
  },
  {
    label: "Integration",
    icon: <Settings2 />,
    path: "integration",
  },
  {
    label: "Settings",
    icon: <Settings />,
    path: "settings",
  },
  // {
  //   label: "Appointment",
  //   icon: <SquareUser />,
  //   path: "appointment",
  // },
  // {
  //   label: "Email Marketing",
  //   icon: <MailIcon />,
  //   path: "email-marketing",
  // },
];

type TABS_MENU_PROPS = {
  label: string;
  icon?: React.ReactElement;
};

export const TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: "all",
    icon: <MailIcon />,
  },
  {
    label: "unread",
    icon: <MailIcon />,
  },
  {
    label: "expired",
    icon: <TimerIcon />,
  },
];

export const HELP_DESK_TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: "help desk",
  },
  {
    label: "task summary",
  },
];

export const APPOINTMENT_TABLE_HEADER = [
  "Name",
  "RequestedTime",
  "Added Time",
  "Domain",
];

export const EMAIL_MARKETING_HEADER = ["Id", "Email", "Answers", "Domain"];

export const BOT_TABS_MENU: TABS_MENU_PROPS[] = [
  {
    label: "chat",
    icon: <MessageSquare />,
  },
  {
    label: "helpdesk",
    icon: <UserRoundPen />,
  },
];
