CREATE TYPE "FoodCategory" AS ENUM (
    'MAIN_DISHES',
    'SIDES',
    'DESSERTS',
    'AVAILABLE_FOR_CATERING',
    'OTHER_ITEMS'
);

ALTER TABLE "Food"
ADD COLUMN "category" "FoodCategory" NOT NULL DEFAULT 'MAIN_DISHES';

UPDATE "Food"
SET "category" = CASE
    WHEN NOT "isOnTruck" AND "isForCatering" THEN 'AVAILABLE_FOR_CATERING'::"FoodCategory"
    WHEN NOT "isOnTruck" AND NOT "isForCatering" THEN 'OTHER_ITEMS'::"FoodCategory"
    WHEN lower(coalesce("name", '') || ' ' || coalesce("description", '')) LIKE ANY (ARRAY[
        '%dessert%',
        '%cake%',
        '%flan%',
        '%cookie%',
        '%brownie%',
        '%pie%',
        '%cheesecake%',
        '%ice cream%',
        '%helado%',
        '%tres leches%',
        '%pudding%'
    ]) THEN 'DESSERTS'::"FoodCategory"
    WHEN lower(coalesce("name", '') || ' ' || coalesce("description", '')) LIKE ANY (ARRAY[
        '%side%',
        '%fries%',
        '%rice%',
        '%beans%',
        '%tostones%',
        '%maduros%',
        '%yuca%',
        '%salad%',
        '%slaw%',
        '%chips%',
        '%plantain%'
    ]) THEN 'SIDES'::"FoodCategory"
    ELSE 'MAIN_DISHES'::"FoodCategory"
END;
