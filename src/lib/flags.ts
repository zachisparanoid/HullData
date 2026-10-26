// Country -> emoji flag for the picker + welcome cards. Falls back to an anchor.
const FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  France: "🇫🇷",
  Singapore: "🇸🇬",
  Italy: "🇮🇹",
  Germany: "🇩🇪",
  Australia: "🇦🇺",
  Netherlands: "🇳🇱",
  Taiwan: "🇹🇼",
  China: "🇨🇳",
  Canada: "🇨🇦",
  "New Zealand": "🇳🇿",
  Turkey: "🇹🇷",
  Poland: "🇵🇱",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Finland: "🇫🇮",
};

export function countryFlag(country: string): string {
  return FLAGS[country] ?? "⚓";
}
