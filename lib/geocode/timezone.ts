function offsetMinutesAt(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asIfUtc - date.getTime()) / 60000;
}

/**
 * Interprets a "YYYY-MM-DDTHH:mm" local wall-clock string as if it were
 * observed in `timeZone`, returning the equivalent UTC instant. Needed
 * because the sky computation requires a precise UTC Date, but the form
 * collects the date/time as the user experienced it locally.
 */
export function zonedTimeToUtc(localDateTimeIso: string, timeZone: string): Date {
  const naiveUtc = new Date(`${localDateTimeIso}:00Z`);
  const offset = offsetMinutesAt(naiveUtc, timeZone);
  return new Date(naiveUtc.getTime() - offset * 60000);
}

export function utcToZonedTime(utcDateStr: string, timeZone: string): { date: string; time: string } {
  const date = new Date(utcDateStr);
  if (isNaN(date.getTime())) {
    return { date: "", time: "" };
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}
