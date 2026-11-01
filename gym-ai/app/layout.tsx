import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const themeInit = `(function(){try{var stored=localStorage.getItem("theme");var dark=stored?stored==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;

export const metadata: Metadata = {
  title: "GymAI: Training plans that adapt to you",
  description:
    "GymAI builds your weekly program, adjusts it after every session, and tells you exactly what to lift next.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
