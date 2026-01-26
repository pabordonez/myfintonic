-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinancialEntity` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `FinancialEntity_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientFinancialEntity` (
    `id` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(15, 2) NULL,
    `initialBalance` DECIMAL(15, 2) NULL,
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
CREATE TABLE `FinancialProduct` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('CURRENT_ACCOUNT', 'SAVINGS_ACCOUNT', 'FIXED_TERM_DEPOSIT', 'INVESTMENT_FUND', 'STOCKS') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `financialEntityId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'PAUSED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `clientId` VARCHAR(191) NOT NULL,
    `currentBalance` DECIMAL(15, 2) NULL,
    `monthlyInterestRate` DECIMAL(5, 4) NULL,
    `initialCapital` DECIMAL(15, 2) NULL,
    `annualInterestRate` DECIMAL(5, 4) NULL,
    `maturityDate` DATETIME(3) NULL,
    `interestPaymentFreq` VARCHAR(191) NULL,
    `numberOfUnits` DECIMAL(15, 6) NULL,
    `netAssetValue` DECIMAL(15, 2) NULL,
    `totalPurchaseValue` DECIMAL(15, 2) NULL,
    `numberOfShares` DECIMAL(15, 2) NULL,
    `unitPurchasePrice` DECIMAL(15, 2) NULL,
    `currentMarketPrice` DECIMAL(15, 2) NULL,
    `fees` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FinancialProduct_clientId_idx`(`clientId`),
    INDEX `FinancialProduct_type_idx`(`type`),
    INDEX `FinancialProduct_financialEntityId_idx`(`financialEntityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ValueHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `value` DECIMAL(15, 2) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    INDEX `ValueHistory_productId_idx`(`productId`),
    INDEX `ValueHistory_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientFinancialEntityValueHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `value` DECIMAL(15, 2) NOT NULL,
    `previousValue` DECIMAL(15, 2) NULL,
    `clientFinancialEntityId` VARCHAR(191) NOT NULL,

    INDEX `ClientFinancialEntityValueHistory_clientFinancialEntityId_idx`(`clientFinancialEntityId`),
    INDEX `ClientFinancialEntityValueHistory_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    INDEX `ProductTransaction_productId_idx`(`productId`),
    INDEX `ProductTransaction_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClientFinancialEntity` ADD CONSTRAINT `ClientFinancialEntity_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientFinancialEntity` ADD CONSTRAINT `ClientFinancialEntity_financialEntityId_fkey` FOREIGN KEY (`financialEntityId`) REFERENCES `FinancialEntity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialProduct` ADD CONSTRAINT `FinancialProduct_financialEntityId_fkey` FOREIGN KEY (`financialEntityId`) REFERENCES `FinancialEntity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialProduct` ADD CONSTRAINT `FinancialProduct_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ValueHistory` ADD CONSTRAINT `ValueHistory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `FinancialProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientFinancialEntityValueHistory` ADD CONSTRAINT `ClientFinancialEntityValueHistory_clientFinancialEntityId_fkey` FOREIGN KEY (`clientFinancialEntityId`) REFERENCES `ClientFinancialEntity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductTransaction` ADD CONSTRAINT `ProductTransaction_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `FinancialProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
