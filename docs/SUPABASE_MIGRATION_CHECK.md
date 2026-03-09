# Supabase 마이그레이션 확인 가이드

Supabase Dashboard에서 “이것저것” 실행한 마이그레이션이 프로젝트와 일치하는지 확인할 때 사용하세요.

---

## 1. 마이그레이션 순서와 내용 요약

| 순서 | 파일명 | 내용 |
|------|--------|------|
| 1 | `20250212000000_initial_schema.sql` | **restaurants**, **tables**, **menu_items**, **orders**, **order_items**, **private_reviews** 테이블 생성 + 인덱스 |
| 2 | `20250212000001_order_page_fields.sql` | `tables.table_number`, `menu_items.category`, `menu_items.spicy_level` 추가 |
| 3 | `20250212000002_ai_docent_columns.sql` | `menu_items`에 `ai_docent_ko`, `ai_docent_en`, `ai_docent_zh`, `ai_docent_ja` 추가 |
| 4 | `20250212000003_reviews_food_service_liked.sql` | `private_reviews`에 `food_rating`, `service_rating`, `liked_items` 추가 |
| 5 | `20250212000004_weekly_reports.sql` | **weekly_reports** 테이블 생성 (restaurant_id, week_start, report_json) |
| 6 | `20250212000005_restaurant_owners.sql` | **restaurant_owners** 테이블 생성 (user_id, restaurant_id) + 인덱스 |

---

## 2. Supabase에서 확인하는 방법

### 방법 A: Table Editor로 눈으로 확인

**있어야 할 테이블 (7개)**  
- `restaurants`  
- `tables`  
- `menu_items`  
- `orders`  
- `order_items`  
- `private_reviews`  
- `weekly_reports`  
- `restaurant_owners`  

**테이블별 필수 컬럼 요약**

- **restaurants**: `id`, `name`, `slug`, `logo_url`, `name_i18n`, `created_at`, `updated_at`
- **tables**: `id`, `restaurant_id`, `name`, `table_number`, `qr_code`, `created_at`, `updated_at`
- **menu_items**: `id`, `restaurant_id`, `name`, `description`, `name_i18n`, `description_i18n`, `price`, `image_url`, `docent_content`, `sort_order`, `is_available`, `category`, `spicy_level`, `ai_docent_ko`, `ai_docent_en`, `ai_docent_zh`, `ai_docent_ja`, `created_at`, `updated_at`
- **orders**: `id`, `restaurant_id`, `table_id`, `status`, `total_amount`, `payment_status`, `locale`, `payment_provider`, `payment_key`, `created_at`, `updated_at`
- **order_items**: `id`, `order_id`, `menu_item_id`, `quantity`, `unit_price`, `options`, `created_at`
- **private_reviews**: `id`, `order_id`, `restaurant_id`, `rating`, `comment`, `food_rating`, `service_rating`, `liked_items`, `created_at`
- **weekly_reports**: `id`, `restaurant_id`, `week_start`, `report_json`, `created_at` + UNIQUE(restaurant_id, week_start)
- **restaurant_owners**: `user_id`, `restaurant_id`, `created_at` + PK(user_id, restaurant_id)

### 방법 B: SQL Editor에서 한 번에 확인

Supabase **SQL Editor**에 아래 쿼리를 붙여 넣고 실행하면, 프로젝트에서 기대하는 테이블·컬럼이 실제로 있는지 확인할 수 있습니다.

```sql
-- 1) 테이블 존재 여부
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 기대 목록: order_items, menu_items, orders, private_reviews, restaurant_owners, restaurants, tables, weekly_reports (8개)


-- 2) 테이블별 컬럼 목록 (누락 컬럼 확인용)
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;


-- 3) orders 테이블 제약조건 (status, payment_status CHECK)
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.orders'::regclass;
```

- (1)으로 테이블 8개가 모두 있는지 확인  
- (2)로 위 “테이블별 필수 컬럼”과 비교  
- (3)은 선택 사항: `orders.status`, `orders.payment_status`에 CHECK 제약이 있는지 확인용

---

## 3. 마이그레이션에 없는, 수동으로 해줘야 할 것

프로젝트 문서(PROGRESS.md) 기준으로, **마이그레이션 파일에는 없고 Supabase에서 따로 설정해야 하는 것**입니다.

| 항목 | 설명 | 확인 위치 |
|------|------|-----------|
| **Realtime** | 대시보드에서 주문 실시간 갱신용 | Database → Replication |
| **Storage 버킷** | 메뉴 이미지·로고 업로드용 | Storage |

### Realtime (orders 테이블)

대시보드에서 **주문 실시간 반영**을 쓰려면 다음 중 하나를 적용해야 합니다.

- **Supabase Dashboard**: **Database** → **Replication** → `orders` 테이블을 복제 대상에 추가  
- 또는 **SQL Editor**에서 실행:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

(이미 추가돼 있으면 “already member” 같은 오류가 나올 수 있음 → 그대로 두면 됨)

### Storage 버킷

- 버킷 이름: **`menu-images`**
- **Public** 버킷으로 생성  
- 메뉴 이미지: `menu-images/` 아래  
- 로고: `menu-images/logos/{restaurant_id}/` 아래  

Supabase **Storage**에서 `menu-images` 버킷이 있고 Public인지 확인하면 됩니다.

---

## 4. 정리

- **마이그레이션 6개**를 **순서대로** 실행했다면, 위 8개 테이블과 컬럼이 있어야 합니다.  
- **확인**: Table Editor로 테이블/컬럼 보거나, 위 **방법 B** SQL로 한 번에 점검.  
- **추가 설정**: Realtime(`orders` 복제), Storage(`menu-images` Public 버킷)는 마이그레이션과 별도로 Supabase에서 설정해야 합니다.

이 파일은 `supabase/migrations/` 내용을 기준으로 작성되었습니다. 마이그레이션을 수정했다면 이 문서도 함께 수정해 두는 것이 좋습니다.
