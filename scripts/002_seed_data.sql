-- Seed sample doctors
INSERT INTO lijecnici (ime, prezime, specijalizacija, email, telefon) VALUES
('Marko', 'Horvat', 'Obiteljska medicina', 'marko.horvat@klinika.hr', '+385 1 234 5678'),
('Ana', 'Kovačić', 'Kardiologija', 'ana.kovacic@klinika.hr', '+385 1 234 5679'),
('Ivana', 'Novak', 'Pedijatrija', 'ivana.novak@klinika.hr', '+385 1 234 5680'),
('Petar', 'Babić', 'Ortopedija', 'petar.babic@klinika.hr', '+385 1 234 5681');

-- Seed sample patients
INSERT INTO pacijenti (ime, prezime, datum_rodjenja, spol, mbo, oib, adresa, grad, postanski_broj, telefon, email, krvna_grupa, alergije) VALUES
('Ivan', 'Marić', '1985-03-15', 'muški', '123456789', '12345678901', 'Ilica 123', 'Zagreb', '10000', '+385 91 234 5678', 'ivan.maric@email.hr', 'A+', ARRAY['penicilin']),
('Maja', 'Jurić', '1990-07-22', 'ženski', '234567890', '23456789012', 'Vukovarska 45', 'Zagreb', '10000', '+385 92 345 6789', 'maja.juric@email.hr', 'B+', ARRAY[]::TEXT[]),
('Luka', 'Pavlić', '1978-11-30', 'muški', '345678901', '34567890123', 'Splitska 67', 'Split', '21000', '+385 93 456 7890', 'luka.pavlic@email.hr', '0+', ARRAY['aspirin', 'orasi']),
('Nina', 'Tomić', '1995-05-18', 'ženski', '456789012', '45678901234', 'Rijeka 89', 'Rijeka', '51000', '+385 94 567 8901', 'nina.tomic@email.hr', 'AB+', ARRAY[]::TEXT[]);

-- Seed sample medical records
INSERT INTO medicinski_nalazi (pacijent_id, lijecnik_id, dijagnoza, simptomi, terapija, status, slijedeci_pregled)
SELECT 
  p.id,
  l.id,
  'Hipertenzija',
  'Povišen krvni tlak, glavobolja',
  'Enalapril 10mg 1x dnevno',
  'završeno',
  CURRENT_DATE + INTERVAL '3 months'
FROM pacijenti p, lijecnici l
WHERE p.oib = '12345678901' AND l.email = 'ana.kovacic@klinika.hr'
LIMIT 1;

INSERT INTO medicinski_nalazi (pacijent_id, lijecnik_id, dijagnoza, simptomi, terapija, status)
SELECT 
  p.id,
  l.id,
  'Prehlada',
  'Kašalj, curenje nosa, temperatura 37.8°C',
  'Paracetamol 500mg po potrebi, puno tekućine',
  'završeno'
FROM pacijenti p, lijecnici l
WHERE p.oib = '23456789012' AND l.email = 'marko.horvat@klinika.hr'
LIMIT 1;

-- Seed sample appointments
INSERT INTO termini (pacijent_id, lijecnik_id, datum_vrijeme, trajanje_minuta, razlog, status)
SELECT 
  p.id,
  l.id,
  CURRENT_TIMESTAMP + INTERVAL '3 days',
  30,
  'Kontrolni pregled',
  'zakazan'
FROM pacijenti p, lijecnici l
WHERE p.oib = '12345678901' AND l.email = 'ana.kovacic@klinika.hr'
LIMIT 1;

INSERT INTO termini (pacijent_id, lijecnik_id, datum_vrijeme, trajanje_minuta, razlog, status)
SELECT 
  p.id,
  l.id,
  CURRENT_TIMESTAMP + INTERVAL '1 week',
  45,
  'Pregled koljena',
  'zakazan'
FROM pacijenti p, lijecnici l
WHERE p.oib = '34567890123' AND l.email = 'petar.babic@klinika.hr'
LIMIT 1;
