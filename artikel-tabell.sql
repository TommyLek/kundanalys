-- Skapa artikeltabell i Supabase
-- Kör detta först innan du importerar artiklarna

CREATE TABLE artikel (
    artikelnummer VARCHAR(50) PRIMARY KEY,
    varugrupp_id VARCHAR(10) REFERENCES varugrupp(varugrupp_id),
    artikeltext VARCHAR(500) NOT NULL,
    leverantor_kontonummer BIGINT,
    aktiv BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index för snabb sökning
CREATE INDEX idx_artikel_varugrupp ON artikel(varugrupp_id);
CREATE INDEX idx_artikel_leverantor ON artikel(leverantor_kontonummer);
CREATE INDEX idx_artikel_text ON artikel USING gin(to_tsvector('swedish', artikeltext));

-- RLS policies
ALTER TABLE artikel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON artikel FOR SELECT USING (true);

-- Trigger för att uppdatera updated_at
CREATE OR REPLACE FUNCTION update_artikel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER artikel_updated_at
    BEFORE UPDATE ON artikel
    FOR EACH ROW
    EXECUTE FUNCTION update_artikel_updated_at();
