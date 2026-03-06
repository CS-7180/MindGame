import { NotificationSettings } from "@/components/settings/NotificationSettings";

export const metadata = {
  title: "Notification Settings | MindGame",
  description: "Manage your push notification preferences for pre-game reminders.",
};

export default function NotificationSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Notifications
          </h1>
          <p className="text-lg text-slate-400">
            Control how and when you receive reminders.
          </p>
        </div>
        <NotificationSettings />
      </div>
    </div>
  );
}
