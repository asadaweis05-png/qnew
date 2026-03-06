
export const WORD_LIST = [
  "soomaali",
  "caafimaad",
  "macallin",
  "xaafad",
  "guri",
  "muqdisho",
  "hargeysa",
  "walaalo",
  "hooyo",
  "aabe",
  "bariis",
  "canjeero",
  "shaah",
  "moos",
  "bisad",
  "dhagax",
  "xiddig",
  "samawade",
  "dayax",
  "qorrax",
  "roob",
  "qabow",
  "kuleel"
];

// This could be replaced with a secured API call in production
export const getTodaysWord = (): string => {
  // For demo, we'll just select a random word
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
};

export const isValidWord = (word: string): boolean => {
  return WORD_LIST.includes(word.toLowerCase());
};
