/*
  Warnings:

  - A unique constraint covering the columns `[method]` on the table `DeliveryMethod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[state]` on the table `OrderState` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DeliveryMethod" ALTER COLUMN "method" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryMethod_method_key" ON "DeliveryMethod"("method");

-- CreateIndex
CREATE UNIQUE INDEX "OrderState_state_key" ON "OrderState"("state");
