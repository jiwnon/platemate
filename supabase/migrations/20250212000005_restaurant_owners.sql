-- 사장님 인증: Supabase Auth 사용자와 레스토랑 소유 관계
-- auth.users는 Supabase가 관리하므로 REFERENCES는 생략하고 application에서 검증

CREATE TABLE IF NOT EXISTS restaurant_owners (
  user_id UUID NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_owners_user ON restaurant_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_owners_restaurant ON restaurant_owners(restaurant_id);

COMMENT ON TABLE restaurant_owners IS '사장님( Supabase Auth user_id )과 레스토랑 소유 관계. 로그인 사용자는 여기 있는 restaurant_id만 접근 가능.';
