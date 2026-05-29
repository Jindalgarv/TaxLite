import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "TaxLite — File Smarter, Save More",
  description: "File your Indian Income Tax Return effortlessly with AI-powered step-by-step guidance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navbar />
        <main className="container animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
