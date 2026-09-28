-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "currentTurn" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "winner" INTEGER;
