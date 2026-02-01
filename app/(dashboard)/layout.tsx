import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardFooter from "@/components/dashboard/DashboardFooter";

export const metadata = {
    title: "Portal do Aluno",
    description: "Gerenciar suas disciplinas, notas e progresso acadêmico",
};

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen flex-col">
            {/* Header */}
            <DashboardHeader />

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <DashboardSidebar />

                {/* Content area */}
                <main className="flex-1 overflow-y-auto bg-gray-950">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {children}
                    </div>

                    {/* Footer */}
                    <DashboardFooter />
                </main>
            </div>
        </div>
    );
}