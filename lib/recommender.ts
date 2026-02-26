// lib/recommender.ts — Rule-based routine recommender
// Pure utility function. No external dependencies, no ML.

export type AnxietySymptom =
    | "overthinking"
    | "physical_tension"
    | "loss_of_focus"
    | "self_doubt"
    | "rushing"
    | "negativity_after_errors";

export type TimePreference = "2min" | "5min" | "10min";

export interface Technique {
    id: string;
    slug: string;
    name: string;
    category: string;
    instruction: string;
    duration_minutes: number;
}

export interface RecommendedTechnique extends Technique {
    match_reason: string;
}

const SYMPTOM_TECHNIQUE_MAP: Record<AnxietySymptom, string[]> = {
    overthinking: ["box_breathing", "focus_word"],
    physical_tension: ["body_scan", "deep_breathing"],
    loss_of_focus: ["focus_word", "visualization"],
    self_doubt: ["affirmations", "visualization"],
    rushing: ["box_breathing", "deep_breathing"],
    negativity_after_errors: ["affirmations", "focus_word"],
};

const SYMPTOM_REASON_MAP: Record<AnxietySymptom, Record<string, string>> = {
    overthinking: {
        box_breathing: "Calms racing thoughts with structured breathing",
        focus_word: "Anchors your mind on a single focal point",
    },
    physical_tension: {
        body_scan: "Releases tension by scanning and relaxing each muscle group",
        deep_breathing: "Activates your body's relaxation response",
    },
    loss_of_focus: {
        focus_word: "Creates a mental anchor to keep you present",
        visualization: "Directs your attention to specific game scenarios",
    },
    self_doubt: {
        affirmations: "Replaces self-doubt with confident self-talk",
        visualization: "Builds confidence by rehearsing peak performance",
    },
    rushing: {
        box_breathing: "Slows down your pace with structured 4-count rhythms",
        deep_breathing: "Brings your heart rate down before competition",
    },
    negativity_after_errors: {
        affirmations: "Builds a positive mindset to bounce back from mistakes",
        focus_word: "Gives you a reset word to refocus after errors",
    },
};

const TIME_LIMITS: Record<TimePreference, number> = {
    "2min": 2,
    "5min": 5,
    "10min": 10,
};

export function recommend(
    symptoms: AnxietySymptom[],
    timePreference: TimePreference,
    allTechniques: Technique[]
): RecommendedTechnique[] {
    const techMap = new Map(allTechniques.map((t) => [t.slug, t]));
    const scored = new Map<string, number>();
    const reasons = new Map<string, string>();

    // Score techniques by symptom frequency match
    for (const symptom of symptoms) {
        for (const slug of SYMPTOM_TECHNIQUE_MAP[symptom] || []) {
            scored.set(slug, (scored.get(slug) || 0) + 1);
            // Keep the first reason (most relevant)
            if (!reasons.has(slug)) {
                reasons.set(slug, SYMPTOM_REASON_MAP[symptom]?.[slug] || "Matched to your profile");
            }
        }
    }

    // Sort by score descending
    const ranked = [...scored.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([slug]) => techMap.get(slug))
        .filter(Boolean) as Technique[];

    // Fill up to time limit
    const limit = TIME_LIMITS[timePreference];
    const result: RecommendedTechnique[] = [];
    let total = 0;

    for (const technique of ranked) {
        if (total + technique.duration_minutes <= limit) {
            result.push({
                ...technique,
                match_reason: reasons.get(technique.slug) || "Matched to your profile",
            });
            total += technique.duration_minutes;
        }
    }

    return result;
}
