-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "subtasks" JSONB NOT NULL DEFAULT '[]';
