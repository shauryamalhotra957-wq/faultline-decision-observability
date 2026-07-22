CREATE INDEX `decisions_created_at_idx` ON `decisions` (`created_at`);--> statement-breakpoint
CREATE INDEX `evidence_decision_id_idx` ON `evidence` (`decision_id`);--> statement-breakpoint
CREATE INDEX `outcomes_decision_id_idx` ON `outcomes` (`decision_id`);--> statement-breakpoint
CREATE INDEX `simulations_decision_id_idx` ON `simulations` (`decision_id`);
