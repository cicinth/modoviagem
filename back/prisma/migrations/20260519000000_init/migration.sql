CREATE TYPE "TripStatus" AS ENUM ('proxima', 'finalizada');

CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trips" (
  "id" UUID NOT NULL,
  "user_id" UUID,
  "name" TEXT NOT NULL,
  "destination" TEXT NOT NULL DEFAULT '',
  "period" TEXT NOT NULL DEFAULT '',
  "status" "TripStatus" NOT NULL DEFAULT 'proxima',
  "has_insurance" BOOLEAN NOT NULL DEFAULT false,
  "insurance_ticket" TEXT NOT NULL DEFAULT '',
  "transport" TEXT NOT NULL DEFAULT '',
  "reservation_code" TEXT NOT NULL DEFAULT '',
  "locator" TEXT NOT NULL DEFAULT '',
  "accommodation" TEXT NOT NULL DEFAULT '',
  "accommodation_dates" TEXT NOT NULL DEFAULT '',
  "accommodation_link" TEXT NOT NULL DEFAULT '',
  "accommodation_address" TEXT NOT NULL DEFAULT '',
  "accommodation_directions" TEXT NOT NULL DEFAULT '',
  "internal_transport" TEXT NOT NULL DEFAULT '',
  "itinerary_markdown" TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trip_image_links" (
  "id" UUID NOT NULL,
  "trip_id" UUID NOT NULL,
  "url" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "trip_image_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trip_documents" (
  "id" UUID NOT NULL,
  "trip_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "trip_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trip_tasks" (
  "id" UUID NOT NULL,
  "trip_id" UUID NOT NULL,
  "text" TEXT NOT NULL,
  "done" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "trip_tasks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "trip_packing_items" (
  "id" UUID NOT NULL,
  "trip_id" UUID NOT NULL,
  "text" TEXT NOT NULL,
  "done" BOOLEAN NOT NULL DEFAULT false,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "trip_packing_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "trips_user_id_idx" ON "trips"("user_id");
CREATE INDEX "trips_status_idx" ON "trips"("status");
CREATE INDEX "trips_updated_at_idx" ON "trips"("updated_at");
CREATE INDEX "trip_image_links_trip_id_idx" ON "trip_image_links"("trip_id");
CREATE INDEX "trip_documents_trip_id_idx" ON "trip_documents"("trip_id");
CREATE INDEX "trip_tasks_trip_id_idx" ON "trip_tasks"("trip_id");
CREATE INDEX "trip_packing_items_trip_id_idx" ON "trip_packing_items"("trip_id");

ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "trip_image_links" ADD CONSTRAINT "trip_image_links_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trip_documents" ADD CONSTRAINT "trip_documents_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trip_tasks" ADD CONSTRAINT "trip_tasks_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "trip_packing_items" ADD CONSTRAINT "trip_packing_items_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;
