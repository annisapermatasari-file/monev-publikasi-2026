ALTER TABLE `reports` ADD `assignedUserId` int;--> statement-breakpoint
CREATE INDEX `reports_assigned_user_idx` ON `reports` (`assignedUserId`);