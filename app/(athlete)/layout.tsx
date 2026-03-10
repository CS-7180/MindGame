import { LocalNotificationProvider } from "@/components/shared/LocalNotificationProvider";

export default function AthleteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LocalNotificationProvider>
            {children}
        </LocalNotificationProvider>
    );
}
