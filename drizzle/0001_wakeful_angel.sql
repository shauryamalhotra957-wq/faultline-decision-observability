CREATE INDEX `decisions_created_at_idx` ON `decisions` (`created_at`);
CREATE INDEX `evidence_decision_id_idx` ON `evidence` (`decision_id`);
CREATE INDEX `outcomes_decision_id_idx` ON `outcomes` (`decision_id`);
CREATE INDEX `simulations_decision_id_idx` ON `simulations` (`decision_id`);
