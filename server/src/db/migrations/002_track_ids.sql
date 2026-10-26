-- Seit dem 26.10.2026 zählen die Projekte je Track (A-003 statt 013, Einheiten
-- als A-002.1). Diese Migration schreibt die gespeicherten Lernstände auf die
-- neuen IDs um. Quiz-, Reflexions- und Karten-IDs tragen die Projekt-ID vorn
-- ("013-card-01" wird "A-003-card-01"); eigene Karten ("own-7") bleiben.

CREATE TEMP TABLE id_map (old TEXT PRIMARY KEY, new TEXT NOT NULL);
INSERT INTO id_map (old, new) VALUES
  ('001', 'A-001'),
  ('026', 'A-001.1'),
  ('006', 'A-002'),
  ('002', 'A-002.1'),
  ('009', 'A-002.2'),
  ('031', 'A-002.3'),
  ('013', 'A-003'),
  ('004', 'A-004');

UPDATE project_progress SET project_id = (SELECT new FROM id_map WHERE old = project_id)
  WHERE project_id IN (SELECT old FROM id_map);
UPDATE notes SET project_id = (SELECT new FROM id_map WHERE old = project_id)
  WHERE project_id IN (SELECT old FROM id_map);
UPDATE own_cards SET project_id = (SELECT new FROM id_map WHERE old = project_id)
  WHERE project_id IN (SELECT old FROM id_map);

UPDATE reflection_answers SET project_id = (SELECT new FROM id_map WHERE old = project_id)
  WHERE project_id IN (SELECT old FROM id_map);
UPDATE reflection_answers SET question_id = (SELECT new FROM id_map WHERE old = substr(question_id, 1, 3)) || substr(question_id, 4)
  WHERE substr(question_id, 1, 3) IN (SELECT old FROM id_map) AND substr(question_id, 4, 1) = '-';

UPDATE quiz_attempts SET project_id = (SELECT new FROM id_map WHERE old = project_id)
  WHERE project_id IN (SELECT old FROM id_map);
UPDATE quiz_attempts SET question_id = (SELECT new FROM id_map WHERE old = substr(question_id, 1, 3)) || substr(question_id, 4)
  WHERE substr(question_id, 1, 3) IN (SELECT old FROM id_map) AND substr(question_id, 4, 1) = '-';

UPDATE card_state SET project_id = (SELECT new FROM id_map WHERE old = project_id)
  WHERE project_id IN (SELECT old FROM id_map);
UPDATE card_state SET card_id = (SELECT new FROM id_map WHERE old = substr(card_id, 1, 3)) || substr(card_id, 4)
  WHERE substr(card_id, 1, 3) IN (SELECT old FROM id_map) AND substr(card_id, 4, 1) = '-';

DROP TABLE id_map;
