import { CorrelationDashboard } from "@/components/correlation/CorrelationDashboard";
import { headers } from "next/headers";

async function getCorrelationData() {
    // We can fetch internally or just call the API route
    // In App Router, it's often better to just reuse the logic or fetch via absolute URL.
    // Since this is a server component, we fetch from our own API using the current request headers to pass along the auth cookie.

    // As a shortcut, we're calling the API endpoint we just created
    // We need the absolute URL in server components.
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    try {
        const res = await fetch(`${protocol}://${host}/api/logs/correlation`, {
            headers: headersList, // Pass cookies
            cache: "no-store"
        });

        if (!res.ok) {
            return null;
        }

        const json = await res.json();
        return json.data;
    } catch (e) {
        console.error("Failed to fetch correlation data:", e);
        return null;
    }
}

export default async function CorrelationPage() {
    const data = await getCorrelationData();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
            <main className="container max-w-5xl mx-auto py-8 px-4 sm:px-6">
                <CorrelationDashboard data={data} />
            </main>
        </div>
    );
}
