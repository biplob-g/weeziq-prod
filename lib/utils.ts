import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ✅ NEW: Utility functions for date handling in localStorage
export const serializeDate = (date: Date | string): string => {
  return typeof date === "string" ? date : date.toISOString();
};

export const deserializeDate = (dateString: string): Date => {
  return new Date(dateString);
};

export const serializeChatRoom = (room: any) => ({
  ...room,
  createdAt: serializeDate(room.createdAt),
  updatedAt: serializeDate(room.updatedAt),
  message: room.message.map((msg: any) => ({
    ...msg,
    createdAt: serializeDate(msg.createdAt),
  })),
});

export const deserializeChatRoom = (room: any) => ({
  ...room,
  createdAt: deserializeDate(room.createdAt),
  updatedAt: deserializeDate(room.updatedAt),
  message: room.message.map((msg: any) => ({
    ...msg,
    createdAt: deserializeDate(msg.createdAt),
  })),
});

// ✅ NEW: Safe date formatting utility
export const safeFormatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

export const safeFormatTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const extractUUIDFromString = (url: string) => {
  return url.match(
    /^([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i
  );
};

export const extractURLfromString = (url: string) => {
  return url.match(/https?:\/\/[^\s"<>]+/);
};

export const postToParent = (message: string) => {
  window.parent.postMessage(message, "*");
};

export const extractEmailsFromString = (text: string) => {
  return text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/gi);
};

// export const pusherServer = new PusherServer({
//   appId: process.env.PUSHER_APP_ID  as string,
//   key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
//   secret: process.env.PUSHER_APP_SECRET as string,
//   cluster: 'mt1',
//   useTLS : true,

// })

// export const pusherClient = new PusherClient(
//   process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
//   {
//     cluster: 'mt1'
//   }
// )

export const getMonthName = (month: number) => {
  return month == 1
    ? "Jan"
    : month == 2
    ? "Feb"
    : month == 3
    ? "Mar"
    : month == 4
    ? "Apr"
    : month == 5
    ? "May"
    : month == 6
    ? "Jun"
    : month == 7
    ? "Jul"
    : month == 8
    ? "Aug"
    : month == 9
    ? "Sep"
    : month == 10
    ? "Oct"
    : month == 11
    ? "Nov"
    : month == 12 && "Dec";
};
