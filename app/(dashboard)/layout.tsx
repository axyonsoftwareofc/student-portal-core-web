// app/(dashboard)/layout.tsx
import { MobileNavProvider } from "@/contexts/MobileNavContext";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return <MobileNavProvider>{children}</MobileNavProvider>;
}
