CREATE TABLE `decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`context` text DEFAULT '' NOT NULL,
	`owner` text DEFAULT 'Unassigned' NOT NULL,
	`domain` text DEFAULT 'Strategy' NOT NULL,
	`status` text DEFAULT 'watch' NOT NULL,
	`confidence` integer DEFAULT 50 NOT NULL,
	`recommendation` text DEFAULT '' NOT NULL,
	`decision_hash` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE `evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`decision_id` text,
	`title` text NOT NULL,
	`source` text NOT NULL,
	`excerpt` text NOT NULL,
	`stance` text DEFAULT 'neutral' NOT NULL,
	`reliability` integer DEFAULT 50 NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`decision_id`) REFERENCES `decisions`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `outcomes` (
	`id` text PRIMARY KEY NOT NULL,
	`decision_id` text NOT NULL,
	`actual_outcome` text NOT NULL,
	`brier_score` real,
	`notes` text DEFAULT '' NOT NULL,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`decision_id`) REFERENCES `decisions`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `simulations` (
	`id` text PRIMARY KEY NOT NULL,
	`decision_id` text,
	`seed` integer NOT NULL,
	`inputs_json` text NOT NULL,
	`outputs_json` text NOT NULL,
	`expected_value` real NOT NULL,
	`downside_p95` real NOT NULL,
	`success_probability` real NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`decision_id`) REFERENCES `decisions`(`id`) ON UPDATE no action ON DELETE cascade
);
