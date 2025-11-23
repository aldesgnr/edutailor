-- Seed data for testing
USE academy;

-- Insert sample training
INSERT INTO Training (Id, Title, Description, Image, DurationTime, Type, Published, AvailableUntil, CreatedAt)
VALUES 
('12128ee8-92fe-4bed-bfdb-a03b9f39fa15', 'Przykładowy Trening VR', 'Trening demonstracyjny z sceną 3D', '/logo.png', 15, 'VR', 1, DATE_ADD(NOW(), INTERVAL 1 YEAR), NOW());

-- Insert training section
INSERT INTO TrainingSection (Id, Title, TrainingId, CreatedAt)
VALUES 
('22128ee8-92fe-4bed-bfdb-a03b9f39fa15', 'Wprowadzenie', '12128ee8-92fe-4bed-bfdb-a03b9f39fa15', NOW());

-- Insert training section component (SCENE type)
INSERT INTO TrainingSectionComponent (Id, Title, Description, Type, DialogId, TrainingSectionId, CreatedAt)
VALUES 
('32128ee8-92fe-4bed-bfdb-a03b9f39fa15', 'Scena 3D', 'Interaktywna scena 3D', 'SCENE', NULL, '22128ee8-92fe-4bed-bfdb-a03b9f39fa15', NOW());

-- Insert training value (links scene UUID)
INSERT INTO TrainingValue (Id, TrainingId, Value, CreatedAt)
VALUES 
('42128ee8-92fe-4bed-bfdb-a03b9f39fa15', '12128ee8-92fe-4bed-bfdb-a03b9f39fa15', '12128ee8-92fe-4bed-bfdb-a03b9f39fa15', NOW());
