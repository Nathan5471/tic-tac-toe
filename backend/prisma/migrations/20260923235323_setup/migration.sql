-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'ENDED_EARLY', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('EMPTY', 'X', 'O');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
    "boardId" TEXT,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "slot1" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "slot2" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "slot3" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "slot4" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "slot5" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "slot6" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "slot7" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "slot8" "SlotStatus" NOT NULL DEFAULT 'EMPTY',
    "slot9" "SlotStatus" NOT NULL DEFAULT 'EMPTY',

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Game_player1Id_player2Id_key" ON "Game"("player1Id", "player2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Board_gameId_key" ON "Board"("gameId");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
