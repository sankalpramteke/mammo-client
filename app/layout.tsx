import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "DISHA — Diagnostic Imaging & Screening for Health Analytics",
  description:
    "DISHA: AI-powered breast cancer screening platform using Federated Learning. Privacy-first, multi-hospital, ResNet101 deep learning.",
  keywords: "DISHA, mammogram, AI, breast cancer detection, federated learning, radiology, screening",
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
        <meta name="theme-color" content="#0f2744" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "13px",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 4px 16px rgba(15,39,68,0.12)",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
