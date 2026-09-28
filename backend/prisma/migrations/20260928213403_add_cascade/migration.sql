-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_gameId_fkey";

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
