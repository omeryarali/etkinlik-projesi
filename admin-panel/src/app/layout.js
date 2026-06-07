import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const adminDisplay = Fraunces({
  variable: "--font-admin-display",
  subsets: ["latin"],
});

const adminSans = Manrope({
  variable: "--font-admin-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "BiKatıl Admin",
  description: "BiKatıl yönetim paneli ve operasyon kontrol merkezi",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="tr"
      className={`${adminDisplay.variable} ${adminSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
