import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "National Mammogram AI Detection System | MoHFW, Government of India",
  description:
    "Federated Learning based Mammogram Cancer Detection System — Ministry of Health & Family Welfare, Government of India",
  keywords: "mammogram, AI, cancer detection, federated learning, AIIMS, NHA, NIC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1a3a6b" />
      </head>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              border: "1px solid #2c5f9e",
              borderRadius: "2px",
              fontSize: "13px",
              fontFamily: "Arial, sans-serif",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
