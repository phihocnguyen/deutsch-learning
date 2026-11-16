const small = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"];
export function germanTimeNumber(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 59) throw new RangeError("Expected integer from 0 to 59");
  if (value < 20) return small[value];
  const tens = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig"][Math.floor(value / 10)];
  const unit = value % 10;
  return unit ? `${unit === 1 ? "ein" : small[unit]}und${tens}` : tens;
}
export function germanClockReadings(hour: number, minute: number) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || !Number.isInteger(minute) || minute < 0 || minute > 59) throw new RangeError("Invalid clock time");
  const current = hour % 12 || 12;
  const next = (current % 12) + 1;
  const formal = `${hour === 1 ? "ein" : germanTimeNumber(hour)} Uhr${minute ? ` ${germanTimeNumber(minute)}` : ""}`;
  let informal: string;
  if (minute === 0) informal = `${current === 1 ? "ein" : germanTimeNumber(current)} Uhr`;
  else if (minute === 15) informal = `Viertel nach ${germanTimeNumber(current)}`;
  else if (minute === 25) informal = `fünf vor halb ${germanTimeNumber(next)}`;
  else if (minute === 30) informal = `halb ${germanTimeNumber(next)}`;
  else if (minute === 35) informal = `fünf nach halb ${germanTimeNumber(next)}`;
  else if (minute === 45) informal = `Viertel vor ${germanTimeNumber(next)}`;
  else if (minute < 30) informal = `${germanTimeNumber(minute)} nach ${germanTimeNumber(current)}`;
  else informal = `${germanTimeNumber(60 - minute)} vor ${germanTimeNumber(next)}`;
  return { formal, informal };
}
