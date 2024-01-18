/*
  Warnings:

  - You are about to drop the column `qrcode2fa` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "qrcode2fa";
