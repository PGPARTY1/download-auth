const durationPattern = /^(\d+)([smhd])$/;

const multipliers: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000
};

export function durationToMs(duration: string): number {
  const match = durationPattern.exec(duration.trim());
  if (!match) {
    throw new Error(`Unsupported duration format: ${duration}`);
  }
  const value = Number(match[1]);
  const unit = match[2];
  return value * multipliers[unit];
}
