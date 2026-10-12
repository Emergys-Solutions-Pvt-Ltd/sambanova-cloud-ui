import { type ApiKey } from "@/types/domain";

/**
 * Mock keys for the Default project. The first rows are the ones shown in the Figma table (the
 * second "Production Key" there is renamed so names stay unique); the rest are generated
 * deterministically so pagination, search and the status filter have 1,000 keys to work on.
 */
export const SEED_API_KEY_COUNT = 1000;

interface SeedRow {
  name: string;
  lastFour: string;
  /** Local time, like Figma shows it. */
  createdAt: string;
  /** How long before "now" the key was last used, in minutes. */
  usedMinutesAgo: number | null;
  status: ApiKey["status"];
}

const figmaRows: SeedRow[] = [
  {
    name: "Production Key",
    lastFour: "a129",
    createdAt: "2026-05-05T09:15:00",
    usedMinutesAgo: 120,
    status: "active",
  },
  {
    name: "Integration Key 2",
    lastFour: "d452",
    createdAt: "2026-04-20T14:30:00",
    usedMinutesAgo: 32,
    status: "active",
  },
  {
    name: "Testing Key 1",
    lastFour: "b230",
    createdAt: "2026-03-15T11:00:00",
    usedMinutesAgo: 60,
    status: "active",
  },
  {
    name: "Production Key 2",
    lastFour: "e563",
    createdAt: "2026-02-10T15:45:00",
    usedMinutesAgo: 120,
    status: "active",
  },
  {
    name: "Release Key 23",
    lastFour: "c341",
    createdAt: "2025-01-25T08:00:00",
    usedMinutesAgo: 43_200,
    status: "disabled",
  },
  {
    name: "Analytics Key 22",
    lastFour: "f674",
    createdAt: "2025-05-05T09:15:00",
    usedMinutesAgo: 1_440,
    status: "disabled",
  },
  {
    name: "Internal tools Key",
    lastFour: "a129",
    createdAt: "2025-04-30T13:00:00",
    usedMinutesAgo: 180,
    status: "active",
  },
  {
    name: "Development Key",
    lastFour: "g785",
    createdAt: "2025-06-02T16:00:00",
    usedMinutesAgo: 240,
    status: "active",
  },
  {
    name: "Testing Key",
    lastFour: "a129",
    createdAt: "2025-06-01T16:00:00",
    usedMinutesAgo: 60,
    status: "active",
  },
];

const baseNames = [
  "Production",
  "Integration",
  "Testing",
  "Release",
  "Analytics",
  "Internal tools",
  "Development",
  "Staging",
  "Billing",
  "Mobile app",
  "Web client",
  "Data pipeline",
];

/** Small deterministic generator so the list is the same on every load. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (value: number) => String(value).padStart(2, "0");
const localIso = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;

function generatedRow(index: number, random: () => number): SeedRow {
  const letter = String.fromCharCode(97 + Math.floor(random() * 7));
  const digits = String(Math.floor(random() * 1000)).padStart(3, "0");
  const created = new Date(2025, 3, 28, 9, 0);
  created.setHours(created.getHours() - index * 11);
  created.setMinutes([0, 15, 30, 45][Math.floor(random() * 4)]!);

  return {
    name: `${baseNames[index % baseNames.length]} Key ${index + 1}`,
    lastFour: `${letter}${digits}`,
    createdAt: localIso(created),
    usedMinutesAgo: random() < 0.05 ? null : Math.floor(random() * 60 * 24 * 90) + 5,
    status: random() < 0.15 ? "disabled" : "active",
  };
}

/** All seed keys, newest first as listed. `now` fixes the "last used" times relative to the request. */
export function buildSeedApiKeys(now: number): ApiKey[] {
  const random = mulberry32(2026);
  const rows = [...figmaRows];
  for (let index = figmaRows.length; index < SEED_API_KEY_COUNT; index += 1) {
    rows.push(generatedRow(index, random));
  }

  return rows.map((row, index) => ({
    id: `key_seed_${index + 1}`,
    name: row.name,
    lastFour: row.lastFour,
    status: row.status,
    createdAt: row.createdAt,
    lastUsedAt:
      row.usedMinutesAgo === null
        ? null
        : new Date(now - row.usedMinutesAgo * 60_000).toISOString(),
  }));
}
