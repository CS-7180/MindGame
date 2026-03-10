"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
// Local notification setup without VAPID
export const isRemindersEnabled = () => typeof window !== "undefined" && localStorage.getItem("remindersEnabled") === "true";
export const setRemindersEnabled = (val: boolean) => typeof window !== "undefined" && localStorage.setItem("remindersEnabled", String(val));

export function NotificationSettings() {
  const router = useRouter();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    async function checkSubscription() {
      try {
        if ("Notification" in window) {
          setPermission(Notification.permission);
          setIsSubscribed(isRemindersEnabled() && Notification.permission === "granted");
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setIsFetching(false);
      }
    }
    checkSubscription();
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsToggling(true);
    try {
      if (checked) {
        // Request permission if not granted
        if (Notification.permission === "default") {
          const res = await Notification.requestPermission();
          setPermission(res);
          if (res !== "granted") {
            toast.error("Notification permission denied");
            setIsToggling(false);
            return;
          }
        }

        setRemindersEnabled(true);
        setIsSubscribed(true);
        toast.success("Notifications enabled!");
      } else {
        setRemindersEnabled(false);
        setIsSubscribed(false);
        toast.success("Notifications disabled");
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      toast.error("Could not update notification settings.");
    } finally {
      setIsToggling(false);
    }
  };

  if (isFetching) {
    return <div className="animate-pulse h-48 bg-slate-900/50 rounded-2xl" />;
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-white">Push Notifications</CardTitle>
            <CardDescription className="text-slate-400">
              Manage your pre-game reminders.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-white">Enable Reminders</div>
            <div className="text-xs text-slate-500">
              Receive a notification on this device before your scheduled games.
            </div>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isToggling || isFetching || permission === "denied"}
          />
        </div>

        {permission === "denied" && (
          <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs">
            <Info className="w-4 h-4 shrink-0" />
            <p>
              Notifications are blocked by your browser. Please enable them in your browser settings to receive reminders.
            </p>
          </div>
        )}

        <div className="text-xs text-slate-500 italic">
          Note: This must be enabled on each device you wish to receive notifications on.
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => router.push("/settings")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
