import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "StepUp Academy", description: "The steps to Up" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
