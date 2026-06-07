import "./globals.css";

export const metadata = {
  title: "BiKatil Admin",
  description: "BiKatil yonetim paneli ve operasyon kontrol merkezi",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
