-- Enable Row Level Security
ALTER TABLE lijecnici ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacijenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicinski_nalazi ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratorijski_rezultati ENABLE ROW LEVEL SECURITY;
ALTER TABLE termini ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- For now, allow all authenticated users to read/write all data
-- In production, you would refine these based on user roles

CREATE POLICY "Allow authenticated users full access to lijecnici"
  ON lijecnici FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to pacijenti"
  ON pacijenti FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to medicinski_nalazi"
  ON medicinski_nalazi FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to laboratorijski_rezultati"
  ON laboratorijski_rezultati FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to termini"
  ON termini FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
