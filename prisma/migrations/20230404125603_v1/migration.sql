-- CreateTable
CREATE TABLE `providers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `providers_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(150) NOT NULL,
    `password` VARCHAR(150) NOT NULL,
    `provider_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `animes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provider_id` INTEGER NULL,
    `url` VARCHAR(250) NULL,
    `title` VARCHAR(250) NULL,
    `image` VARCHAR(250) NULL,
    `description` LONGTEXT NULL,
    `meta` LONGTEXT NULL,

    UNIQUE INDEX `animes_url_key`(`url`),
    UNIQUE INDEX `animes_title_key`(`title`),
    UNIQUE INDEX `animes_image_key`(`image`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookmarks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anime_id` INTEGER NULL,
    `provider_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bookmarks_anime_id_key`(`anime_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `links` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `episodeId` VARCHAR(250) NULL,
    `meta` LONGTEXT NULL,

    UNIQUE INDEX `links_episodeId_key`(`episodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animes` ADD CONSTRAINT `animes_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_anime_id_fkey` FOREIGN KEY (`anime_id`) REFERENCES `animes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
