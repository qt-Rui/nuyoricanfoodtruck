ALTER TABLE "Food"
ADD COLUMN "categories" "FoodCategory"[] NOT NULL DEFAULT ARRAY['MAIN_DISHES'::"FoodCategory"];

UPDATE "Food"
SET "categories" = CASE
    WHEN "isOnTruck" AND "isForCatering" THEN ARRAY[
        CASE
            WHEN "category" IN ('MAIN_DISHES', 'SIDES', 'DESSERTS') THEN "category"
            ELSE 'MAIN_DISHES'::"FoodCategory"
        END,
        'AVAILABLE_FOR_CATERING'::"FoodCategory"
    ]
    WHEN "isOnTruck" THEN ARRAY[
        CASE
            WHEN "category" IN ('MAIN_DISHES', 'SIDES', 'DESSERTS') THEN "category"
            ELSE 'MAIN_DISHES'::"FoodCategory"
        END
    ]
    WHEN "isForCatering" THEN ARRAY['AVAILABLE_FOR_CATERING'::"FoodCategory"]
    ELSE ARRAY['OTHER_ITEMS'::"FoodCategory"]
END;
