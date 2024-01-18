/*
  Warnings:

  - Made the column `img` on table `Channel` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "img" SET NOT NULL;

-- CreateTable
CREATE TABLE "_LastSeen" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_LastSeen_AB_unique" ON "_LastSeen"("A", "B");

-- CreateIndex
CREATE INDEX "_LastSeen_B_index" ON "_LastSeen"("B");

-- AddForeignKey
ALTER TABLE "_LastSeen" ADD CONSTRAINT "_LastSeen_A_fkey" FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LastSeen" ADD CONSTRAINT "_LastSeen_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
