-- Create enum types for Croatian system
CREATE TYPE spol AS ENUM ('muški', 'ženski', 'ostalo');
CREATE TYPE krvna_grupa AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-');
CREATE TYPE status_nalaza AS ENUM ('u tijeku', 'završeno', 'otkazano');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Doctors table (Liječnici)
CREATE TABLE lijecnici (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ime TEXT NOT NULL,
  prezime TEXT NOT NULL,
  specijalizacija TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table (Pacijenti)
CREATE TABLE pacijenti (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ime TEXT NOT NULL,
  prezime TEXT NOT NULL,
  datum_rodjenja DATE NOT NULL,
  spol spol NOT NULL,
  mbo TEXT UNIQUE NOT NULL, -- Matični broj osiguranika
  oib TEXT UNIQUE NOT NULL, -- Osobni identifikacijski broj
  adresa TEXT,
  grad TEXT,
  postanski_broj TEXT,
  telefon TEXT,
  email TEXT,
  krvna_grupa krvna_grupa,
  alergije TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical records table (Medicinski nalazi)
CREATE TABLE medicinski_nalazi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pacijent_id UUID NOT NULL REFERENCES pacijenti(id) ON DELETE CASCADE,
  lijecnik_id UUID NOT NULL REFERENCES lijecnici(id) ON DELETE RESTRICT,
  datum_pregleda TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dijagnoza TEXT NOT NULL,
  simptomi TEXT,
  terapija TEXT,
  napomene TEXT,
  status status_nalaza DEFAULT 'u tijeku',
  slijedeci_pregled DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab results table (Laboratorijski rezultati)
CREATE TABLE laboratorijski_rezultati (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nalaz_id UUID NOT NULL REFERENCES medicinski_nalazi(id) ON DELETE CASCADE,
  naziv_testa TEXT NOT NULL,
  vrijednost TEXT NOT NULL,
  jedinica TEXT,
  referentni_raspon TEXT,
  datum_testa TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table (Termini)
CREATE TABLE termini (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pacijent_id UUID NOT NULL REFERENCES pacijenti(id) ON DELETE CASCADE,
  lijecnik_id UUID NOT NULL REFERENCES lijecnici(id) ON DELETE CASCADE,
  datum_vrijeme TIMESTAMPTZ NOT NULL,
  trajanje_minuta INTEGER DEFAULT 30,
  razlog TEXT,
  status TEXT DEFAULT 'zakazan',
  napomene TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_pacijenti_mbo ON pacijenti(mbo);
CREATE INDEX idx_pacijenti_oib ON pacijenti(oib);
CREATE INDEX idx_nalazi_pacijent ON medicinski_nalazi(pacijent_id);
CREATE INDEX idx_nalazi_lijecnik ON medicinski_nalazi(lijecnik_id);
CREATE INDEX idx_nalazi_datum ON medicinski_nalazi(datum_pregleda);
CREATE INDEX idx_termini_pacijent ON termini(pacijent_id);
CREATE INDEX idx_termini_lijecnik ON termini(lijecnik_id);
CREATE INDEX idx_termini_datum ON termini(datum_vrijeme);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_lijecnici_updated_at BEFORE UPDATE ON lijecnici
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pacijenti_updated_at BEFORE UPDATE ON pacijenti
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicinski_nalazi_updated_at BEFORE UPDATE ON medicinski_nalazi
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_termini_updated_at BEFORE UPDATE ON termini
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
