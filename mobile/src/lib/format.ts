export function formatDateTime(dateValue?: string | null) {
  if (!dateValue) {
    return "-";
  }

  return new Date(dateValue).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPrice(isPaid: boolean, price?: number | null) {
  return isPaid ? `${price ?? 0} TL` : "Ücretsiz";
}

export function formatLocation(city?: string, district?: string) {
  if (!city && !district) {
    return "-";
  }

  if (!city) {
    return district ?? "-";
  }

  if (!district) {
    return city;
  }

  return `${city} / ${district}`;
}

export function getInitial(value?: string | null) {
  return value?.trim()?.charAt(0)?.toUpperCase() || "U";
}

export function percentage(value: number, total: number) {
  if (!total || total <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}
