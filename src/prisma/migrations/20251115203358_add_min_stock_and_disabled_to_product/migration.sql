-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minimumStock" INTEGER NOT NULL DEFAULT 1;
