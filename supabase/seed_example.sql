-- 테스트용 시드 (선택) - Supabase SQL Editor에서 실행
-- 1. 새 마이그레이션 적용 후
-- 2. 아래에서 프로젝트 ID 등 필요 시 수정

-- 식당 1개
INSERT INTO restaurants (id, name, slug, name_i18n)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '맛있는 한국집',
  'tasty-korean',
  '{"ko": "맛있는 한국집", "en": "Tasty Korean", "zh": "美味韩餐", "ja": "おいしい韓国料理"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 테이블 1개 (table_number 추가)
INSERT INTO tables (id, restaurant_id, name, table_number)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  '1번 테이블',
  1
)
ON CONFLICT (id) DO NOTHING;

-- 메뉴 몇 개 (category, spicy_level 사용)
INSERT INTO menu_items (restaurant_id, name, name_i18n, price, category, spicy_level, sort_order)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '김치찌개', '{"ko": "김치찌개", "en": "Kimchi Jjigae", "zh": "泡菜汤", "ja": "キムチチゲ"}'::jsonb, 8000, 'main', 2, 1),
  ('a0000000-0000-0000-0000-000000000001', '된장찌개', '{"ko": "된장찌개", "en": "Doenjang Jjigae", "zh": "大酱汤", "ja": "テンジャンチゲ"}'::jsonb, 7000, 'main', 0, 2),
  ('a0000000-0000-0000-0000-000000000001', '비빔밥', '{"ko": "비빔밥", "en": "Bibimbap", "zh": "拌饭", "ja": "ビビンバ"}'::jsonb, 9000, 'main', 0, 3),
  ('a0000000-0000-0000-0000-000000000001', '공기밥', '{"ko": "공기밥", "en": "Rice", "zh": "米饭", "ja": "ご飯"}'::jsonb, 1000, 'side', 0, 10),
  ('a0000000-0000-0000-0000-000000000001', '콜라', '{"ko": "콜라", "en": "Cola", "zh": "可乐", "ja": "コーラ"}'::jsonb, 2000, 'drink', 0, 20)
ON CONFLICT DO NOTHING;

-- 주문 페이지 테스트 URL (실제 UUID는 Supabase에서 확인)
-- /order/a0000000-0000-0000-0000-000000000001/b0000000-0000-0000-0000-000000000001
-- 또는 /en/order/a0000000-0000-0000-0000-000000000001/b0000000-0000-0000-0000-000000000001
