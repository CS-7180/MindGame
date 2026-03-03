export const TIME_TIERS = {
    QUICK: {
        id: "quick",
        label: "Quick",
        maxMinutes: 2,
        description: "2 min or less",
    },
    STANDARD: {
        id: "standard",
        label: "Standard",
        minMinutes: 3,
        maxMinutes: 5,
        description: "3-5 min",
    },
    EXTENDED: {
        id: "extended",
        label: "Extended",
        minMinutes: 6,
        maxMinutes: 10,
        description: "6-10 min",
    },
} as const;

export type TimeTierId = keyof typeof TIME_TIERS;
export type TimeTierValues = typeof TIME_TIERS[TimeTierId]["id"];

/**
 * Helper to determine which tier a given duration falls into.
 * Any duration not explicitly matching Quick or Standard falls into Extended or beyond.
 */
export function getTierForDuration(minutes: number): typeof TIME_TIERS[TimeTierId] {
    if (minutes <= TIME_TIERS.QUICK.maxMinutes) {
        return TIME_TIERS.QUICK;
    }
    if (minutes >= TIME_TIERS.STANDARD.minMinutes && minutes <= TIME_TIERS.STANDARD.maxMinutes) {
        return TIME_TIERS.STANDARD;
    }
    return TIME_TIERS.EXTENDED;
}
