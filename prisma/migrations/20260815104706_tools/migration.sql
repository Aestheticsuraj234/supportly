-- AlterTable
ALTER TABLE "message" ADD COLUMN     "agentName" TEXT,
ADD COLUMN     "toolsUsed" TEXT[] DEFAULT ARRAY[]::TEXT[];
