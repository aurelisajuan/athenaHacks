import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ETA+",
  description: "Generated by NJZ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');
          `}
        </style>
      </head>
      <body className="varela-round-regular antialiased">{children}</body>
    </html>
  );
}
