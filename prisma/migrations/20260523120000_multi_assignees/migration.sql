-- CreateTable
CREATE TABLE "task_assignees" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "task_assignees_pkey" PRIMARY KEY ("id")
);

-- Migrate existing single assignees
INSERT INTO "task_assignees" ("id", "task_id", "user_id")
SELECT gen_random_uuid()::text, "id", "assigned_to"
FROM "tasks"
WHERE "assigned_to" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_assigned_to_fkey";

-- DropIndex
DROP INDEX IF EXISTS "tasks_assigned_to_idx";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "assigned_to";

-- CreateIndex
CREATE UNIQUE INDEX "task_assignees_task_id_user_id_key" ON "task_assignees"("task_id", "user_id");
CREATE INDEX "task_assignees_task_id_idx" ON "task_assignees"("task_id");
CREATE INDEX "task_assignees_user_id_idx" ON "task_assignees"("user_id");

-- AddForeignKey
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
