'use client';

type Props = {
  couponCode: string;
  onClose: () => void;
};

function downloadCouponImage(code: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 260;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 배경
  ctx.fillStyle = '#fff7ed';
  ctx.fillRect(0, 0, 480, 260);

  // 점선 테두리
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 6]);
  ctx.strokeRect(12, 12, 456, 236);

  // 상단 배지
  ctx.fillStyle = '#f97316';
  ctx.fillRect(12, 12, 456, 70);

  // 상단 텍스트
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('10% DISCOUNT COUPON', 240, 57);

  // 쿠폰 코드
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 42px "Courier New"';
  ctx.fillText(code, 240, 145);

  // 설명
  ctx.fillStyle = '#6b7280';
  ctx.font = '15px Arial';
  ctx.fillText('Next visit: Enter this code at checkout', 240, 185);

  // 유효기간
  ctx.fillStyle = '#9ca3af';
  ctx.font = '13px Arial';
  ctx.fillText('Valid for 1 year  |  platem8.xyz', 240, 220);

  // 다운로드
  const link = document.createElement('a');
  link.download = `coupon-${code}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function CouponModal({ couponCode, onClose }: Props) {
  const shareText = `재방문 10% 할인 쿠폰 받았어요!\n쿠폰 코드: ${couponCode}\nPlatem8(platem8.xyz) 결제 시 입력하세요 🎟`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: '10% 할인 쿠폰', text: shareText });
        return;
      } catch {
        // 취소 또는 실패 시 클립보드로 폴백
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      alert('쿠폰 정보가 클립보드에 복사되었습니다!');
    } catch {
      alert(`쿠폰 코드: ${couponCode}`);
    }
  };

  const emailBody = encodeURIComponent(
    `재방문 10% 할인 쿠폰\n쿠폰 코드: ${couponCode}\n\nPlatem8(platem8.xyz) 결제 화면에서 코드를 입력하세요.`
  );
  const emailUrl = `mailto:?subject=${encodeURIComponent('재방문 10% 할인 쿠폰')}&body=${emailBody}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent('https://platem8.xyz')}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="bg-orange-500 px-6 py-5 text-center">
          <p className="text-4xl">🎟</p>
          <p className="mt-1 text-xl font-bold text-white">할인 쿠폰이 발급되었습니다!</p>
          <p className="mt-1 text-sm text-orange-100">리뷰를 남겨주셔서 감사합니다 🙏</p>
        </div>

        {/* 쿠폰 본문 */}
        <div className="border-b-2 border-dashed border-orange-200 bg-orange-50 px-6 py-5 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-orange-400">쿠폰 번호</p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-gray-900">
            {couponCode}
          </p>
          <div className="mt-3 inline-block rounded-full bg-orange-100 px-4 py-1">
            <p className="text-sm font-semibold text-orange-700">10% 할인 · 유효기간 1년</p>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            다음 방문 시 결제 화면에서 이 번호를 입력하세요
          </p>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-2 p-4">
          <button
            type="button"
            onClick={() => downloadCouponImage(couponCode)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-medium text-white transition hover:bg-gray-700"
          >
            📥 이미지로 저장
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-medium text-white transition hover:bg-green-600"
          >
            📤 공유하기
          </button>
          <div className="flex gap-2">
            <a
              href={emailUrl}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              ✉️ 이메일
            </a>
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              💬 LINE
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-sm text-gray-400 transition hover:text-gray-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
