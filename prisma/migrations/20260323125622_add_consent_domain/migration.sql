-- CreateTable
CREATE TABLE `Consent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `requesterName` VARCHAR(191) NOT NULL,
    `dataType` VARCHAR(191) NOT NULL,
    `purpose` VARCHAR(191) NOT NULL,
    `status` ENUM('REQUESTED', 'GRANTED', 'LIMITED', 'REVOKED', 'EXPIRED', 'DENIED') NOT NULL DEFAULT 'REQUESTED',
    `allowedActions` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `decisionAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Consent_userId_idx`(`userId`),
    INDEX `Consent_status_idx`(`status`),
    INDEX `Consent_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DataAccessRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `consentId` INTEGER NOT NULL,
    `requesterName` VARCHAR(191) NOT NULL,
    `requestedAction` VARCHAR(191) NOT NULL,
    `requestedPurpose` VARCHAR(191) NOT NULL,
    `isAllowed` BOOLEAN NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DataAccessRequest_consentId_idx`(`consentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `consentId` INTEGER NULL,
    `action` ENUM('USER_REGISTERED', 'CONSENT_REQUESTED', 'CONSENT_GRANTED', 'CONSENT_DENIED', 'CONSENT_LIMITED', 'CONSENT_REVOKED', 'CONSENT_EXPIRED', 'ACCESS_REQUESTED', 'ACCESS_GRANTED', 'ACCESS_DENIED') NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_consentId_idx`(`consentId`),
    INDEX `AuditLog_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Consent` ADD CONSTRAINT `Consent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DataAccessRequest` ADD CONSTRAINT `DataAccessRequest_consentId_fkey` FOREIGN KEY (`consentId`) REFERENCES `Consent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
