import { Inter } from "next/font/google";

import "./globals.css";

import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { cn } from "@/lib/utils";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata = {
    title: "Radioactive Duck Game - Client",
    description: "A game that blends ASL, Duck Hunt, and Radioactive elements",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <Providers>
                <body className={cn(inter.className, "bg-[#5784BA]")}>
                    <main>{children}</main>
                    <Footer />
                </body>
            </Providers>
        </html>
    );
}
