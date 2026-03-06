import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();

        // Verify authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { data: null, error: { message: "Unauthorized", code: "UNAUTHORIZED" } },
                { status: 401 }
            );
        }

        // Fetch athlete's game logs that have both pre and post data
        // Order by log_date ascending for easier streak calculation
        const { data: logs, error: logsError } = await supabase
            .from("game_logs")
            .select(`
                log_date,
                routine_completed,
                post_performance,
                post_mental_state
            `)
            .eq("athlete_id", user.id)
            .not("post_performance", "is", null) // Must have post-game data
            .order("log_date", { ascending: true });

        if (logsError) {
            console.error("Error fetching logs for correlation:", logsError);
            return NextResponse.json(
                { data: null, error: { message: logsError.message, code: "DB_ERROR" } },
                { status: 500 }
            );
        }

        const total_logged = logs?.length || 0;
        const has_enough_data = total_logged >= 5;

        // If not enough data, we still return the count so the UI knows
        if (!has_enough_data) {
            return NextResponse.json({
                data: {
                    total_logged,
                    has_enough_data,
                    routine_done_avg_perf: 0,
                    routine_skip_avg_perf: 0,
                    routine_done_avg_mental: 0,
                    routine_skip_avg_mental: 0,
                    current_streak: 0
                },
                error: null
            });
        }

        // Calculate averages
        let donePerfSum = 0, doneMentalSum = 0, doneCount = 0;
        let skipPerfSum = 0, skipMentalSum = 0, skipCount = 0;

        for (const log of logs) {
            if (log.routine_completed === 'yes') {
                donePerfSum += log.post_performance!;
                doneMentalSum += log.post_mental_state!;
                doneCount++;
            } else {
                skipPerfSum += log.post_performance!;
                skipMentalSum += log.post_mental_state!;
                skipCount++;
            }
        }

        // Calculate current streak
        // "Streak" = consecutive *games* where routine was completed.
        // Array is sorted chronologically ascending
        let current_streak = 0;
        // Read backwards to get current streak
        for (let i = logs.length - 1; i >= 0; i--) {
            if (logs[i].routine_completed === 'yes') {
                current_streak++;
            } else {
                break; // Streak broken
            }
        }

        return NextResponse.json({
            data: {
                total_logged,
                has_enough_data,
                // Use 1 decimal place, convert back to number
                routine_done_avg_perf: doneCount > 0 ? Number((donePerfSum / doneCount).toFixed(1)) : 0,
                routine_skip_avg_perf: skipCount > 0 ? Number((skipPerfSum / skipCount).toFixed(1)) : 0,
                routine_done_avg_mental: doneCount > 0 ? Number((doneMentalSum / doneCount).toFixed(1)) : 0,
                routine_skip_avg_mental: skipCount > 0 ? Number((skipMentalSum / skipCount).toFixed(1)) : 0,
                current_streak
            },
            error: null
        });

    } catch (error) {
        console.error("Correlation API Error:", error);
        return NextResponse.json(
            { data: null, error: { message: "Internal server error", code: "INTERNAL_ERROR" } },
            { status: 500 }
        );
    }
}
