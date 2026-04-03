-- CreateEnum
CREATE TYPE "RecurrenceRule" AS ENUM ('daily', 'weekly', 'monthly', 'weekdays');

-- AlterTable
ALTER TABLE "Project"
ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WorkItem"
ADD COLUMN "recurrenceRule" "RecurrenceRule",
ADD COLUMN "sectionId" TEXT;

-- CreateTable
CREATE TABLE "ProjectSection" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subtask" (
  "id" TEXT NOT NULL,
  "workItemId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subtask_pkey" PRIMARY KEY ("id")
);

-- Backfill stable project ordering
WITH ordered_projects AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" ASC, "id" ASC) AS row_num
  FROM "Project"
)
UPDATE "Project"
SET "sortOrder" = ordered_projects.row_num
FROM ordered_projects
WHERE "Project"."id" = ordered_projects."id";

-- CreateIndex
CREATE INDEX "ProjectSection_projectId_position_idx" ON "ProjectSection"("projectId", "position");

-- CreateIndex
CREATE INDEX "Subtask_workItemId_position_idx" ON "Subtask"("workItemId", "position");

-- AddForeignKey
ALTER TABLE "ProjectSection" ADD CONSTRAINT "ProjectSection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkItem" ADD CONSTRAINT "WorkItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ProjectSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subtask" ADD CONSTRAINT "Subtask_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
