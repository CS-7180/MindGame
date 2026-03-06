import { CoachHeader } from "@/components/coach/CoachHeader";

export default function CoachLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white flex flex-col">
            <CoachHeader />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
