import React from "react";
import "../globals.css";

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className="antialiased bg-transparent">{children}</body>
    </html>
  );
}
