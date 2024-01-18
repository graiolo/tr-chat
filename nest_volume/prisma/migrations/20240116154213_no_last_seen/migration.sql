/*
  Warnings:

  - You are about to drop the `_LastSeen` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_LastSeen" DROP CONSTRAINT "_LastSeen_A_fkey";

-- DropForeignKey
ALTER TABLE "_LastSeen" DROP CONSTRAINT "_LastSeen_B_fkey";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "lastSeen" TEXT[];

-- DropTable
DROP TABLE "_LastSeen";
