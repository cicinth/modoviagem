INSERT INTO "users" ("id", "name", "email", "password_hash", "created_at", "updated_at")
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Demo Viajário',
  'demo@viajario.local',
  '17093f3cf3e0875a0c0ab3f9011e6761:0d2dde76bb98e13c0503c2f582509d4982578b87dcbdcbc9df8994123dc9001a0708724e64fc63946a1cf82d21bceb48e3b103ab191f5f0b7ada6a1526c8ad24',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "password_hash" = EXCLUDED."password_hash",
  "updated_at" = CURRENT_TIMESTAMP;
