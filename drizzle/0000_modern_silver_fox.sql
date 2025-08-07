CREATE TABLE `focus_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text,
	`duration` integer NOT NULL,
	`completed_at` text DEFAULT CURRENT_TIMESTAMP,
	`session_type` text DEFAULT 'focus',
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`topic` text NOT NULL,
	`date` text NOT NULL,
	`time` text DEFAULT '09:00',
	`is_done` integer DEFAULT false,
	`progress` integer DEFAULT 0,
	`difficulty` text DEFAULT 'medium',
	`order_index` integer DEFAULT 0,
	`focus_sessions` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
