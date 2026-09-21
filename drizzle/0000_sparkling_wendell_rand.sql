CREATE TABLE `documentation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int,
	`title` varchar(180) NOT NULL,
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`storageKey` varchar(500) NOT NULL,
	`storageUrl` varchar(700) NOT NULL,
	`uploadedBy` int NOT NULL,
	`status` enum('verified','review') NOT NULL DEFAULT 'review',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documentation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `locations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`province` varchar(120) NOT NULL,
	`address` text,
	`latitude` double NOT NULL,
	`longitude` double NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`officerName` varchar(160) NOT NULL,
	`status` enum('completed','review','in_progress') NOT NULL DEFAULT 'in_progress',
	`completeness` int NOT NULL DEFAULT 0,
	`notes` text,
	`submittedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `documentation_created_idx` ON `documentation` (`createdAt`);--> statement-breakpoint
CREATE INDEX `locations_province_idx` ON `locations` (`province`);--> statement-breakpoint
CREATE INDEX `reports_location_idx` ON `reports` (`locationId`);--> statement-breakpoint
CREATE INDEX `reports_status_idx` ON `reports` (`status`);