// app/layout.tsx
import "./css/style.css";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/common/toast-provider";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const nacelle = localFont({
    src: [
        {
            path: "../public/fonts/nacelle-regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../public/fonts/nacelle-semibold.woff2",
            weight: "600",
            style: "normal",
        },
    ],
    variable: "--font-nacelle",
    display: "swap",
});

export const metadata = {
    title: "Code Plus - Portal do Aluno",
    description: "Plataforma de ensino de programação",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
        <body
            className={`${inter.variable} ${nacelle.variable} bg-gray-950 font-inter text-base text-gray-200 antialiased`}
        >
        <AuthProvider>
            <div className="flex min-h-screen flex-col overflow-hidden">
                {children}
            </div>
        </AuthProvider>
        <ToastProvider />
        </body>
        </html>
    );
}