export const FOOD_CATEGORIES = [
  "MAIN_DISHES",
  "SIDES",
  "DESSERTS",
  "AVAILABLE_FOR_CATERING",
  "OTHER_ITEMS",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

const PRIMARY_MENU_CATEGORIES = ["MAIN_DISHES", "SIDES", "DESSERTS"] as const;

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  MAIN_DISHES: "Main Dishes",
  SIDES: "Sides",
  DESSERTS: "Desserts",
  AVAILABLE_FOR_CATERING: "Available for Catering",
  OTHER_ITEMS: "Other Items",
};

const SIDE_KEYWORDS = [
  "side",
  "fries",
  "rice",
  "beans",
  "tostones",
  "maduros",
  "yuca",
  "salad",
  "slaw",
  "chips",
  "plantain",
] as const;

const DESSERT_KEYWORDS = [
  "dessert",
  "cake",
  "flan",
  "cookie",
  "brownie",
  "pie",
  "cheesecake",
  "ice cream",
  "helado",
  "tres leches",
  "pudding",
] as const;

const includesAnyKeyword = (text: string, keywords: readonly string[]) =>
  keywords.some((keyword) => text.includes(keyword));

const classifyTruckItemFromText = (
  name: string,
  description: string | null | undefined
): FoodCategory => {
  const nameText = name.toLowerCase();
  const descriptionText = (description ?? "").toLowerCase();

  // Name has priority over description to avoid combo wording conflicts.
  if (includesAnyKeyword(nameText, DESSERT_KEYWORDS)) return "DESSERTS";
  if (includesAnyKeyword(nameText, SIDE_KEYWORDS)) return "SIDES";

  if (includesAnyKeyword(descriptionText, DESSERT_KEYWORDS)) return "DESSERTS";
  if (includesAnyKeyword(descriptionText, SIDE_KEYWORDS)) return "SIDES";

  return "MAIN_DISHES";
};

export const normalizeFoodCategory = (value: unknown): FoodCategory | null => {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
  if ((FOOD_CATEGORIES as readonly string[]).includes(normalized)) {
    return normalized as FoodCategory;
  }

  return null;
};

const dedupeCategories = (categories: FoodCategory[]) => {
  const seen = new Set<FoodCategory>();
  const ordered: FoodCategory[] = [];

  for (const category of categories) {
    if (seen.has(category)) continue;
    seen.add(category);
    ordered.push(category);
  }

  return ordered;
};

export const normalizeFoodCategories = (value: unknown): FoodCategory[] => {
  if (Array.isArray(value)) {
    return dedupeCategories(
      value
        .map((category) => normalizeFoodCategory(category))
        .filter((category): category is FoodCategory => Boolean(category))
    );
  }

  const single = normalizeFoodCategory(value);
  return single ? [single] : [];
};

interface CategorySource {
  name: string;
  description?: string | null;
  categories?: unknown;
  category?: unknown;
  isOnTruck?: boolean | null;
  isForCatering?: boolean | null;
}

export const deriveFoodCategories = (food: CategorySource): FoodCategory[] => {
  const explicitCategories = normalizeFoodCategories(food.categories);
  if (explicitCategories.length) return explicitCategories;

  const explicitCategory = normalizeFoodCategory(food.category);
  if (explicitCategory) return [explicitCategory];

  const isOnTruck = Boolean(food.isOnTruck);
  const isForCatering = Boolean(food.isForCatering);

  if (!isOnTruck && isForCatering) return ["AVAILABLE_FOR_CATERING"];
  if (!isOnTruck && !isForCatering) return ["OTHER_ITEMS"];

  const categories: FoodCategory[] = [classifyTruckItemFromText(food.name, food.description)];
  if (isForCatering) categories.push("AVAILABLE_FOR_CATERING");

  return dedupeCategories(categories);
};

export const getPrimaryFoodCategory = (categories: readonly FoodCategory[]) => {
  if (!categories.length) return "MAIN_DISHES" as FoodCategory;

  for (const category of categories) {
    if ((PRIMARY_MENU_CATEGORIES as readonly string[]).includes(category)) {
      return category;
    }
  }

  return categories[0];
};

export const getLegacyAvailabilityFromCategories = (categories: readonly FoodCategory[]) => {
  const isForCatering = categories.includes("AVAILABLE_FOR_CATERING");
  const isOnTruck = categories.some((category) =>
    (PRIMARY_MENU_CATEGORIES as readonly string[]).includes(category)
  );

  return { isOnTruck, isForCatering };
};
