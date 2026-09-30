// lib/formatDate.js

/**
 * Format ngày cập nhật:
 * - Hôm nay → "Hôm nay"
 * - Hôm qua → "Hôm qua"
 * - Từ 2 ngày trở đi → "DD/MM/YYYY" (VD: 30/9/2026)
 */
export function formatRelativeDate(dateInput) {
  if (!dateInput) return 'Chưa cập nhật';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Chưa cập nhật';

  const now = new Date();

  // Reset giờ về 00:00:00 để so sánh theo NGÀY
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays = Math.floor(
    (today - compareDate) / (1000 * 60 * 60 * 24)
  );

  // Hôm nay
  if (diffDays === 0) return 'Hôm nay';

  // Hôm qua
  if (diffDays === 1) return 'Hôm qua';

  // Từ 2 ngày trở đi → DD/MM/YYYY (không pad số 0)
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format đầy đủ có giờ (dùng cho tooltip hover)
 */
export function formatFullDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Màu badge theo độ mới:
 * - Hôm nay → emerald (xanh lá)
 * - Hôm qua → amber (vàng)
 * - Cũ hơn → slate (xám)
 */
export function getDateBadgeColor(dateInput) {
  if (!dateInput) return 'slate';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'slate';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const diffDays = Math.floor(
    (today - compareDate) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'emerald';
  if (diffDays === 1) return 'amber';
  return 'slate';
}
