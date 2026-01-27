-- Creación de la base de datos (opcional si ya la crea Docker)
CREATE DATABASE IF NOT EXISTS myfintonic_db;
USE myfintonic_db;

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS `Client` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `nickname` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de Entidades Financieras
CREATE TABLE IF NOT EXISTS `FinancialEntity` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(15, 2) NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE INDEX `idx_financial_entity_name_client`(`name`, `clientId`),
    INDEX `idx_financial_entity_client`(`clientId`),
    CONSTRAINT `fk_financial_entity_client` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de Histórico de Valor de Entidades
CREATE TABLE IF NOT EXISTS `FinancialEntityValueHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `value` DECIMAL(15, 2) NOT NULL,
    `previousValue` DECIMAL(15, 2) NULL,
    `financialEntityId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `idx_fe_history_entity`(`financialEntityId`),
    CONSTRAINT `fk_fe_history_entity` FOREIGN KEY (`financialEntityId`) REFERENCES `FinancialEntity`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla principal de Productos Financieros
-- Estrategia: Single Table Inheritance (Todos los tipos en una tabla)
CREATE TABLE IF NOT EXISTS `FinancialProduct` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('CURRENT_ACCOUNT', 'SAVINGS_ACCOUNT', 'FIXED_TERM_DEPOSIT', 'INVESTMENT_FUND', 'STOCKS') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `financialEntityId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'PAUSED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `clientId` VARCHAR(191) NOT NULL,
    
    -- Campos específicos (NULLABLE para ahorrar espacio y permitir flexibilidad)
    -- Cuentas y Depósitos
    `currentBalance` DECIMAL(15, 2) NULL,
    `monthlyInterestRate` DECIMAL(5, 4) NULL,
    `initialCapital` DECIMAL(15, 2) NULL,
    `annualInterestRate` DECIMAL(5, 4) NULL,
    `maturityDate` DATETIME(3) NULL,
    `interestPaymentFreq` VARCHAR(191) NULL,
    
    -- Fondos y Acciones
    `numberOfUnits` DECIMAL(15, 6) NULL,
    `netAssetValue` DECIMAL(15, 2) NULL,
    `totalPurchaseValue` DECIMAL(15, 2) NULL,
    `numberOfShares` DECIMAL(15, 2) NULL,
    `unitPurchasePrice` DECIMAL(15, 2) NULL,
    `currentMarketPrice` DECIMAL(15, 2) NULL,
    
    -- Campo JSON para estructuras complejas (comisiones/fees)
    `fees` JSON NULL,
    
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `idx_financial_product_client`(`clientId`),
    INDEX `idx_financial_product_type`(`type`),
    INDEX `idx_financial_product_entity`(`financialEntityId`),
    CONSTRAINT `fk_financial_product_client` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_financial_product_entity` FOREIGN KEY (`financialEntityId`) REFERENCES `FinancialEntity`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de Histórico de Valores
CREATE TABLE IF NOT EXISTS `ValueHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `value` DECIMAL(15, 2) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `idx_value_history_product`(`productId`),
    INDEX `idx_value_history_date`(`date`),
    
    CONSTRAINT `fk_value_history_product` FOREIGN KEY (`productId`) REFERENCES `FinancialProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de Transacciones (para Cuentas Corrientes) - Renombrada para evitar palabra reservada
CREATE TABLE IF NOT EXISTS `ProductTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`),
    INDEX `idx_product_transaction_product`(`productId`),
    INDEX `idx_product_transaction_date`(`date`),
    
    CONSTRAINT `fk_product_transaction_product` FOREIGN KEY (`productId`) REFERENCES `FinancialProduct`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;