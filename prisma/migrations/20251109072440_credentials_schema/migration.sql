-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('GEMINI');

-- AlterTable
ALTER TABLE "node" ADD COLUMN     "credentialId" TEXT;

-- CreateTable
CREATE TABLE "credential" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" "CredentialType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "credential_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "credential" ADD CONSTRAINT "credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node" ADD CONSTRAINT "node_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
