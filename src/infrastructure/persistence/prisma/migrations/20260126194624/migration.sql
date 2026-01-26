/*
  Warnings:

  - You are about to drop the column `balance` on the `FinancialEntity` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `FinancialEntity` table. All the data in the column will be lost.
  - You are about to drop the `FinancialEntityValueHistory` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `FinancialEntity` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `FinancialEntity` DROP FOREIGN KEY `FinancialEntity_clientId_fkey`;

-- DropForeignKey
ALTER TABLE `FinancialEntityValueHistory` DROP FOREIGN KEY `FinancialEntityValueHistory_financialEntityId_fkey`;

-- DropIndex
DROP INDEX `FinancialEntity_clientId_idx` ON `FinancialEntity`;

-- DropIndex
DROP INDEX `FinancialEntity_name_clientId_key` ON `FinancialEntity`;

-- AlterTable
ALTER TABLE `FinancialEntity` DROP COLUMN `balance`,
    DROP COLUMN `clientId`;

-- DropTable
DROP TABLE `FinancialEntityValueHistory`;

-- CreateTable
CREATE TABLE `ClientFinancialEntity` (
    `id` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(15, 2) NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `financialEntityId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ClientFinancialEntity_clientId_idx`(`clientId`),
    INDEX `ClientFinancialEntity_financialEntityId_idx`(`financialEntityId`),
    UNIQUE INDEX `ClientFinancialEntity_clientId_financialEntityId_key`(`clientId`, `financialEntityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientFinancialEntityValueHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `value` DECIMAL(15, 2) NOT NULL,
    `clientFinancialEntityId` VARCHAR(191) NOT NULL,

    INDEX `ClientFinancialEntityValueHistory_clientFinancialEntityId_idx`(`clientFinancialEntityId`),
    INDEX `ClientFinancialEntityValueHistory_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `FinancialEntity_name_key` ON `FinancialEntity`(`name`);

-- AddForeignKey
ALTER TABLE `ClientFinancialEntity` ADD CONSTRAINT `ClientFinancialEntity_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientFinancialEntity` ADD CONSTRAINT `ClientFinancialEntity_financialEntityId_fkey` FOREIGN KEY (`financialEntityId`) REFERENCES `FinancialEntity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientFinancialEntityValueHistory` ADD CONSTRAINT `ClientFinancialEntityValueHistory_clientFinancialEntityId_fkey` FOREIGN KEY (`clientFinancialEntityId`) REFERENCES `ClientFinancialEntity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
