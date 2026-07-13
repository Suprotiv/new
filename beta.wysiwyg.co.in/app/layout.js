import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

import { Playfair_Display } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { SiteContentProvider } from "./components/SiteContentProvider";


const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});


const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-playfair",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Wysiwyg Communications",
  description: "Website for Wysiwyg Communcations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakarta.className }>
      <body >
        <SiteContentProvider>
         <Navbar />
         <ScrollToTop/>
        {children}
        <Footer/>
        </SiteContentProvider>
      </body>
    </html>
  );
}
