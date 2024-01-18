-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "hashedRt" TEXT,
    "img" TEXT NOT NULL DEFAULT '',
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "isPlaying" BOOLEAN NOT NULL DEFAULT false,
    "Wins" INTEGER NOT NULL DEFAULT 0,
    "Losses" INTEGER NOT NULL DEFAULT 0,
    "is2faEnabled" BOOLEAN NOT NULL DEFAULT false,
    "secret2fa" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
