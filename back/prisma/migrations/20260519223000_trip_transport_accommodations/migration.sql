ALTER TABLE "trips" ADD COLUMN "transport_type" TEXT NOT NULL DEFAULT '';

CREATE TABLE "trip_accommodations" (
  "id" UUID NOT NULL,
  "trip_id" UUID NOT NULL,
  "destination" TEXT NOT NULL DEFAULT '',
  "name" TEXT NOT NULL,
  "dates" TEXT NOT NULL DEFAULT '',
  "link" TEXT NOT NULL DEFAULT '',
  "address" TEXT NOT NULL DEFAULT '',
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "trip_accommodations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "trip_accommodations_trip_id_idx" ON "trip_accommodations"("trip_id");

ALTER TABLE "trip_accommodations"
ADD CONSTRAINT "trip_accommodations_trip_id_fkey"
FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "trip_accommodations" (
  "id",
  "trip_id",
  "destination",
  "name",
  "dates",
  "link",
  "address",
  "position"
)
SELECT
  gen_random_uuid(),
  "id",
  COALESCE(NULLIF("destination", ''), ''),
  "accommodation",
  COALESCE(NULLIF("accommodation_dates", ''), ''),
  COALESCE(NULLIF("accommodation_link", ''), ''),
  COALESCE(NULLIF("accommodation_address", ''), ''),
  0
FROM "trips"
WHERE COALESCE(NULLIF("accommodation", ''), '') <> '';
