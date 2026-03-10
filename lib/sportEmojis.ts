export const SPORT_EMOJIS: Record<string, string> = {
    soccer: "⚽", basketball: "🏀", tennis: "🎾", baseball: "⚾",
    football: "🏈", track: "🏃", swimming: "🏊", volleyball: "🏐",
    golf: "⛳", hockey: "🏒", cricket: "🏏", rugby: "🏉",
    lacrosse: "🥍", boxing: "🥊", martial_arts: "🥋", skiing: "⛷️",
    snowboarding: "🏂", surfing: "🏄", cycling: "🚴", wrestling: "🤼",
    fencing: "🤺", rowing: "🚣", badminton: "🏸", table_tennis: "🏓",
    softball: "🥎", gymnastics: "🤸", archery: "🏹", bowling: "🎳",
};

export const getSportEmoji = (sport: string): string =>
    SPORT_EMOJIS[sport?.toLowerCase().replace(/\s+/g, '_')] || "🏆";
