const kickoffFormatter = new Intl.DateTimeFormat("he-IL", {
  timeZone: "Asia/Jerusalem",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatMatchKickoff(utcDate: string): string | null {
  const kickoff = new Date(utcDate);
  return Number.isNaN(kickoff.getTime()) ? null : kickoffFormatter.format(kickoff);
}
