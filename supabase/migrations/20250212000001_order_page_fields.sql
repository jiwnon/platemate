-- 테이블 번호 표시용
ALTER TABLE tables ADD COLUMN IF NOT EXISTS table_number INTEGER;

-- 메뉴 카테고리·매운맛
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS spicy_level INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN menu_items.category IS 'main, side, drink 등';
COMMENT ON COLUMN menu_items.spicy_level IS '0=안매움, 1~5 매운 정도';
