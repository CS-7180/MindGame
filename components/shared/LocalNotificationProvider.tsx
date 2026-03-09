"use client";

import { useEffect, useState } from "react";
import { isRemindersEnabled } from "@/components/settings/NotificationSettings";
import { toast } from "sonner";

export function LocalNotificationProvider({ children }: { children: React.ReactNode }) {
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        if (!isRemindersEnabled() || Notification.permission !== "granted") {
            return;
        }

        // Check games every 5 minutes
        const checkGames = async () => {
            try {
                const res = await fetch("/api/games", { cache: "no-store" });
                if (!res.ok) return;
                const { data: upcomingGames } = await res.json();

                if (!upcomingGames || !Array.isArray(upcomingGames)) return;

                const now = new Date();

                upcomingGames.forEach((game) => {
                    const gameDateObj = new Date(`${game.game_date}T${game.game_time}`);
                    // Trigger notification if within the reminder offset window (and hasn't already passed the game)
                    const reminderTime = new Date(gameDateObj.getTime() - game.reminder_offset_mins * 60000);

                    // We notify if "now" is past the reminder time, but before the game starts.
                    // Also check a notified key in localStorage to prevent spamming
                    const notifiedKey = `notified_${game.id}`;

                    if (now >= reminderTime && now < gameDateObj) {
                        if (!localStorage.getItem(notifiedKey)) {
                            new Notification(`Upcoming Game: ${game.game_name}`, {
                                body: `Your ${game.sport} game starts in ${game.reminder_offset_mins} minutes. Time to do your routine!`,
                                icon: "/icon.png" // Fallback if no icon
                            });
                            localStorage.setItem(notifiedKey, "true");
                            toast.success(`Reminder: ${game.game_name} is starting soon!`);
                        }
                    }
                });
            } catch (error) {
                console.error("Failed to check upcoming games for notifications:", error);
            }
        };

        // Check immediately on mount, then every 5 mins
        if (!hasChecked) {
            checkGames();
            setHasChecked(true);
        }

        const intervalId = setInterval(checkGames, 5 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [hasChecked]);

    return <>{children}</>;
}
