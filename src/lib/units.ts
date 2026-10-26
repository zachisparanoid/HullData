// Pure imperial <-> metric conversion math. Canonical values are always
// stored in imperial base units (feet, gallons, pounds, knots) and converted
// only at render time — stored values are NEVER mutated.

export const FT_TO_M = 0.3048;
export const GAL_TO_L = 3.785411784; // US gallons
export const LBS_TO_KG = 0.45359237;
export const KTS_TO_MPH = 1.150779448;

export const feetToMeters = (ft: number): number => ft * FT_TO_M;
export const metersToFeet = (m: number): number => m / FT_TO_M;

export const gallonsToLiters = (gal: number): number => gal * GAL_TO_L;
export const litersToGallons = (l: number): number => l / GAL_TO_L;

export const poundsToKilograms = (lbs: number): number => lbs * LBS_TO_KG;
export const kilogramsToPounds = (kg: number): number => kg / LBS_TO_KG;

export const knotsToMph = (kts: number): number => kts * KTS_TO_MPH;
export const mphToKnots = (mph: number): number => mph / KTS_TO_MPH;
