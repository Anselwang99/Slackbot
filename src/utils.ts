export const isNumeric = (str: string) => {
  const n = str.trim();
  if (n.length === 0) return false;
  return +n === +n;
};

export const hoursToMillis = (n: number | undefined) => {
  if (!n) return 0;
  return n * 1000 * 60 * 60;
};

export const millisToHours = (n: number | undefined) => {
  if (!n) return 0;
  return Math.floor(n / (1000 * 60 * 60));
};
