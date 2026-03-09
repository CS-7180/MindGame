"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  sport: z.string().min(2, { message: "Sport name is required." }),
  game_name: z.string().min(2, { message: "Game name is required." }),
  game_date: z.string().min(1, { message: "Date is required." }),
  game_time: z.string().min(1, { message: "Time is required." }),
  reminder_offset_mins: z.string(),
}).superRefine((data, ctx) => {
  if (data.game_date && data.game_time) {
    const gameDateTime = new Date(`${data.game_date}T${data.game_time}`);
    const now = new Date();
    if (gameDateTime < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Game cannot be in the past.",
        path: ["game_time"],
      });
    }
  }
});

interface GameSchedulerProps {
  defaultSport?: string;
  isSportLocked?: boolean;
}

export function GameScheduler({ defaultSport = "", isSportLocked = false }: GameSchedulerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sport: defaultSport,
      game_date: format(new Date(), "yyyy-MM-dd"),
      game_time: "14:00",
      reminder_offset_mins: "45",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const payload = {
        ...values,
        reminder_offset_mins: parseInt(values.reminder_offset_mins, 10),
      };

      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to schedule game");
      }

      toast.success("Game scheduled successfully!");
      router.refresh();
      router.push("/home");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto bg-slate-900/50 border-slate-800 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Schedule Game</CardTitle>
        <CardDescription className="text-slate-400">
          Set your game time and we&apos;ll remind you to run your routine.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="sport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Sport</FormLabel>
                  <FormControl>
                    {isSportLocked ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-950/50 border border-slate-800">
                        <Lock className="h-4 w-4 text-slate-500" />
                        <span className="text-white font-medium">{field.value}</span>
                      </div>
                    ) : (
                      <Input placeholder="e.g. Basketball, Soccer" className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600" {...field} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="game_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">
                    Game Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Practice Match vs Eagles" className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="game_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="date" min={format(new Date(), "yyyy-MM-dd")} className="bg-slate-950/50 border-slate-800 text-white text-sm" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="game_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="time" className="bg-slate-950/50 border-slate-800 text-white text-sm" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reminder_offset_mins"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Reminder Before Game</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-950/50 border-slate-800 text-white">
                        <SelectValue placeholder="Select offset" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="45">45 minutes before</SelectItem>
                      <SelectItem value="60">60 minutes before</SelectItem>
                      <SelectItem value="90">90 minutes before</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-slate-500">
                    You&apos;ll get a notification to start your routine.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white py-6 rounded-xl"
                onClick={() => router.push("/home")}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                disabled={loading}
              >
                {loading ? "Scheduling..." : "Schedule Game"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
