-- AlterTable
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "trip_diary_entries" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "place_type" TEXT NOT NULL,
    "place_name" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_diary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_diary_photos" (
    "id" UUID NOT NULL,
    "diary_entry_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_diary_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trip_diary_entries_trip_id_idx" ON "trip_diary_entries"("trip_id");

-- CreateIndex
CREATE INDEX "trip_diary_photos_diary_entry_id_idx" ON "trip_diary_photos"("diary_entry_id");

-- AddForeignKey
ALTER TABLE "trip_diary_entries" ADD CONSTRAINT "trip_diary_entries_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_diary_photos" ADD CONSTRAINT "trip_diary_photos_diary_entry_id_fkey" FOREIGN KEY ("diary_entry_id") REFERENCES "trip_diary_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
