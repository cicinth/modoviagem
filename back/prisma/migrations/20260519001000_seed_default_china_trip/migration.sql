INSERT INTO "trips" (
  "id",
  "name",
  "destination",
  "period",
  "status",
  "has_insurance",
  "itinerary_markdown",
  "created_at",
  "updated_at"
)
VALUES (
  '2183df34-f43d-46db-8620-7a0a30bdb0d4',
  'China e Alemanha 2026',
  'China e Alemanha',
  '03/11/2026 a 24/11/2026',
  'proxima',
  true,
  '# China & Alemanha - Novembro 2026',
  '2026-05-18T20:22:02.220Z',
  '2026-05-18T22:47:32.732Z'
)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "trip_image_links" ("id", "trip_id", "url", "position")
SELECT "id"::uuid, "trip_id"::uuid, "url", "position"
FROM (
VALUES
  ('018d6fa5-ef97-4b6d-a70b-3436bda3c1d1', '2183df34-f43d-46db-8620-7a0a30bdb0d4', 'https://i.pinimg.com/736x/83/3d/6a/833d6ac43d034400f1f0fb1e10f38dec.jpg', 0),
  ('b9b1920a-51ef-4936-9376-7928046521d0', '2183df34-f43d-46db-8620-7a0a30bdb0d4', 'https://i.pinimg.com/736x/da/9b/ff/da9bffdd126e456290a579eef6c50f9c.jpg', 1),
  ('9c0d71c2-0d77-4d75-a101-117390bec78a', '2183df34-f43d-46db-8620-7a0a30bdb0d4', 'https://i.pinimg.com/736x/93/18/53/931853b715529f8beeb992919e73891d.jpg', 2),
  ('f1fe5ada-6f91-49ee-aa7a-f1b01d95985c', '2183df34-f43d-46db-8620-7a0a30bdb0d4', 'https://i.pinimg.com/736x/9b/db/01/9bdb018799d8cdbe884d5f4be9981357.jpg', 3)
) AS v("id", "trip_id", "url", "position")
WHERE NOT EXISTS (
  SELECT 1
  FROM "trip_image_links" existing
  WHERE existing."trip_id" = v."trip_id"::uuid
    AND existing."position" = v."position"
    AND existing."url" = v."url"
);

INSERT INTO "trip_tasks" ("id", "trip_id", "text", "done", "position", "updated_at")
SELECT "id"::uuid, "trip_id"::uuid, "text", "done", "position", "updated_at"
FROM (
VALUES (
  '522f954c-0e5e-48c5-89e9-9dd5f768ff49',
  '2183df34-f43d-46db-8620-7a0a30bdb0d4',
  'comprar passagens',
  false,
  0,
  CURRENT_TIMESTAMP
)
) AS v("id", "trip_id", "text", "done", "position", "updated_at")
WHERE NOT EXISTS (
  SELECT 1
  FROM "trip_tasks" existing
  WHERE existing."trip_id" = v."trip_id"::uuid
    AND existing."position" = v."position"
    AND existing."text" = v."text"
);

INSERT INTO "trip_packing_items" ("id", "trip_id", "text", "done", "position", "updated_at")
SELECT "id"::uuid, "trip_id"::uuid, "text", "done", "position", "updated_at"
FROM (
VALUES
  ('34b2db23-f6e2-465b-8625-a7fa401e8082', '2183df34-f43d-46db-8620-7a0a30bdb0d4', 'Passaporte ou documento', false, 0, CURRENT_TIMESTAMP),
  ('4cebbdfa-b312-4800-b812-54a231fc14c1', '2183df34-f43d-46db-8620-7a0a30bdb0d4', 'Carregador', false, 1, CURRENT_TIMESTAMP),
  ('3e1eb6d7-b09d-484e-8a81-b7e0164b91cb', '2183df34-f43d-46db-8620-7a0a30bdb0d4', 'Seguro viagem', false, 2, CURRENT_TIMESTAMP),
  ('70b7b09f-21bc-442a-83c2-96fbe7b63e89', '2183df34-f43d-46db-8620-7a0a30bdb0d4', 'Remedios pessoais', false, 3, CURRENT_TIMESTAMP),
  ('93f0a821-fd89-42f1-a76a-36d63ad91a8c', '2183df34-f43d-46db-8620-7a0a30bdb0d4', 'Roupas confortaveis', false, 4, CURRENT_TIMESTAMP)
) AS v("id", "trip_id", "text", "done", "position", "updated_at")
WHERE NOT EXISTS (
  SELECT 1
  FROM "trip_packing_items" existing
  WHERE existing."trip_id" = v."trip_id"::uuid
    AND existing."position" = v."position"
    AND existing."text" = v."text"
);
