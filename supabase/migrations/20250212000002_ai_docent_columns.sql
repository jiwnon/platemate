-- AI 도슨트 결과 저장 (locale별)
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ai_docent_ko TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ai_docent_en TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ai_docent_zh TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ai_docent_ja TEXT;

COMMENT ON COLUMN menu_items.ai_docent_ko IS 'JSON: { cultural_context, ingredients[], recommendation }';
COMMENT ON COLUMN menu_items.ai_docent_en IS 'JSON: { cultural_context, ingredients[], recommendation }';
COMMENT ON COLUMN menu_items.ai_docent_zh IS 'JSON: { cultural_context, ingredients[], recommendation }';
COMMENT ON COLUMN menu_items.ai_docent_ja IS 'JSON: { cultural_context, ingredients[], recommendation }';
