import { prisma } from "./prisma";

export interface SiteSettings {
  openDate: string;
  openHours: string;
  doorDashUrl: string;
}

const defaultSiteSettings: SiteSettings = {
  openDate: process.env.FOOD_TRUCK_OPEN_DATE?.trim() || "Friday - Sunday",
  openHours: process.env.FOOD_TRUCK_OPEN_HOURS?.trim() || "11:00 AM - 8:00 PM",
  doorDashUrl:
    process.env.FOOD_TRUCK_DOORDASH_URL?.trim() || "https://www.doordash.com/",
};

type SiteSettingRow = {
  openDate: string;
  openHours: string;
  doorDashUrl: string;
};

const normalizeText = (value: string | undefined, fallback: string, maxLen = 120) => {
  const trimmed = value?.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
};

const normalizeDoorDashUrl = (value: string | undefined) => {
  const trimmed = value?.trim();
  if (!trimmed) return defaultSiteSettings.doorDashUrl;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    return defaultSiteSettings.doorDashUrl;
  }

  return defaultSiteSettings.doorDashUrl;
};

const normalizeSiteSettings = (input: Partial<SiteSettings>): SiteSettings => ({
  openDate: normalizeText(input.openDate, defaultSiteSettings.openDate),
  openHours: normalizeText(input.openHours, defaultSiteSettings.openHours),
  doorDashUrl: normalizeDoorDashUrl(input.doorDashUrl),
});

const ensureSiteSettingsTable = async () => {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "SiteSetting" (
      "id" INTEGER PRIMARY KEY,
      "openDate" TEXT NOT NULL,
      "openHours" TEXT NOT NULL,
      "doorDashUrl" TEXT NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
};

const upsertSiteSettings = async (settings: SiteSettings) => {
  await prisma.$executeRaw`
    INSERT INTO "SiteSetting" ("id", "openDate", "openHours", "doorDashUrl", "updatedAt")
    VALUES (1, ${settings.openDate}, ${settings.openHours}, ${settings.doorDashUrl}, CURRENT_TIMESTAMP)
    ON CONFLICT ("id")
    DO UPDATE SET
      "openDate" = EXCLUDED."openDate",
      "openHours" = EXCLUDED."openHours",
      "doorDashUrl" = EXCLUDED."doorDashUrl",
      "updatedAt" = CURRENT_TIMESTAMP
  `;
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
  await ensureSiteSettingsTable();

  const rows = await prisma.$queryRaw<SiteSettingRow[]>`
    SELECT "openDate", "openHours", "doorDashUrl"
    FROM "SiteSetting"
    WHERE "id" = 1
    LIMIT 1
  `;

  if (rows.length > 0) {
    return normalizeSiteSettings(rows[0]);
  }

  const defaults = normalizeSiteSettings(defaultSiteSettings);
  await upsertSiteSettings(defaults);
  return defaults;
};

export const saveSiteSettings = async (
  settings: Partial<SiteSettings>
): Promise<SiteSettings> => {
  const normalized = normalizeSiteSettings(settings);
  await ensureSiteSettingsTable();
  await upsertSiteSettings(normalized);
  return normalized;
};
