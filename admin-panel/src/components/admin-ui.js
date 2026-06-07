import Link from "next/link";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatAdminDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminSurface({
  children,
  className = "",
  tone = "default",
  padded = true,
}) {
  const tones = {
    default:
      "border-[#ead8c9]/90 bg-[linear-gradient(180deg,rgba(255,250,245,0.98),rgba(246,237,228,0.95))] shadow-[0_28px_80px_rgba(59,38,28,0.09)]",
    muted:
      "border-[#e2ccbb]/90 bg-[linear-gradient(180deg,rgba(250,241,230,0.96),rgba(241,228,214,0.94))] shadow-[0_22px_60px_rgba(96,63,44,0.1)]",
    contrast:
      "border-[#3a2922] bg-[linear-gradient(145deg,rgba(38,29,26,0.98),rgba(56,38,31,0.96))] text-white shadow-[0_32px_90px_rgba(22,13,10,0.3)]",
    overlay:
      "border-[#8a5b47]/35 bg-[linear-gradient(180deg,rgba(118,78,60,0.78),rgba(63,43,34,0.9))] text-white shadow-[0_28px_70px_rgba(17,10,8,0.24)]",
    accent:
      "border-[#e1c3ae]/95 bg-[linear-gradient(180deg,rgba(251,239,228,0.98),rgba(243,225,209,0.95))] shadow-[0_24px_70px_rgba(97,62,43,0.1)]",
  };

  return (
    <section
      className={cn(
        "rounded-[30px] border backdrop-blur-sm",
        tones[tone],
        padded ? "p-6 sm:p-7" : "",
        className
      )}
    >
      {children}
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  aside,
}) {
  return (
    <AdminSurface
      tone="contrast"
      className="relative overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,_rgba(230,152,111,0.34),_transparent_48%)]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-[rgba(232,204,171,0.08)] blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_340px]">
        <div className="space-y-4">
          {eyebrow ? (
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#f0c4a5]">
              {eyebrow}
            </p>
          ) : null}

          <div className="max-w-3xl space-y-3">
            <h1 className="font-[family:var(--font-admin-display)] text-4xl leading-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#ebddd2] sm:text-base">
              {description}
            </p>
          </div>

          {children}
        </div>

        {aside ? <div className="relative">{aside}</div> : null}
      </div>
    </AdminSurface>
  );
}

export function MetricCard({
  eyebrow,
  title,
  value,
  helper,
  href,
  tone = "default",
}) {
  const isDark = tone === "contrast" || tone === "overlay";
  const isAccent = tone === "accent";
  const body = (
    <AdminSurface
      tone={tone}
      className={cn(
        "h-full transition duration-200",
        href ? "hover:-translate-y-0.5 hover:shadow-[0_34px_100px_rgba(59,38,28,0.12)]" : ""
      )}
    >
      <div className="space-y-3">
        {eyebrow ? (
          <p
            className={cn(
              "text-[0.72rem] font-semibold uppercase tracking-[0.24em]",
              isDark
                ? "text-[#f0c4a5]"
                : isAccent
                  ? "text-[#9d6241]"
                  : "text-[#b06a47]"
            )}
          >
            {eyebrow}
          </p>
        ) : null}

        <div className="space-y-2">
          <p
            className={cn(
              "text-sm",
              isDark
                ? "text-[#e7d7cb]"
                : isAccent
                  ? "text-[#6b5247]"
                  : "text-[#6f5a4f]"
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              "font-[family:var(--font-admin-display)] text-4xl leading-none",
              isDark ? "text-white" : "text-[#221815]"
            )}
          >
            {value ?? 0}
          </p>
        </div>

        {helper ? (
          <p
            className={cn(
              "text-sm leading-6",
              isDark
                ? "text-[#d8c6b8]"
                : isAccent
                  ? "text-[#6d564a]"
                  : "text-[#7b685e]"
            )}
          >
            {helper}
          </p>
        ) : null}

        {href ? (
          <p
            className={cn(
              "pt-1 text-xs font-semibold uppercase tracking-[0.18em]",
              isDark
                ? "text-[#f6d8c3]"
                : isAccent
                  ? "text-[#a85e3f]"
                  : "text-[#be6d44]"
            )}
          >
            Detaya git
          </p>
        ) : null}
      </div>
    </AdminSurface>
  );

  if (href) {
    return <Link href={href}>{body}</Link>;
  }

  return body;
}

export function Notice({ tone = "danger", title, description, className = "" }) {
  const tones = {
    danger: "border-[#efc2bf] bg-[#fff3f1] text-[#a53d38]",
    success: "border-[#c8decd] bg-[#f3fbf4] text-[#2f6b43]",
    warning: "border-[#ecd8b9] bg-[#fff8ee] text-[#8a6432]",
  };

  return (
    <div
      className={cn(
        "rounded-[24px] border px-5 py-4 shadow-[0_20px_45px_rgba(59,38,28,0.05)]",
        tones[tone],
        className
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      {description ? <p className="mt-1 text-sm leading-6 opacity-90">{description}</p> : null}
    </div>
  );
}

export function LoadingPanel({ title, description }) {
  return (
    <AdminSurface tone="muted" className="overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e6d3c2] bg-white/80">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dba17f] border-t-transparent" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b06a47]">
            BiKatıl Admin
          </p>
          <h3 className="font-[family:var(--font-admin-display)] text-3xl text-[#241a16]">
            {title}
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-[#756356]">
            {description}
          </p>
        </div>
      </div>
    </AdminSurface>
  );
}

export function EmptyPanel({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) {
  const action = actionLabel
    ? actionHref
      ? {
          kind: "link",
        }
      : {
          kind: "button",
        }
    : null;

  return (
    <AdminSurface tone="muted">
      <div className="space-y-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#b06a47]">
          Hazır alan
        </p>
        <div className="space-y-2">
          <h3 className="font-[family:var(--font-admin-display)] text-3xl text-[#241a16]">
            {title}
          </h3>
          <p className="max-w-2xl text-sm leading-6 text-[#756356]">
            {description}
          </p>
        </div>

        {action ? (
          action.kind === "link" ? (
            <Link href={actionHref} className={buttonClassNames("secondary")}>
              {actionLabel}
            </Link>
          ) : (
            <button className={buttonClassNames("secondary")} onClick={onAction}>
              {actionLabel}
            </button>
          )
        ) : null}
      </div>
    </AdminSurface>
  );
}

export function StatusPill({ tone = "neutral", children }) {
  const tones = {
    neutral: "border-[#e4d5c8] bg-white/82 text-[#5f4c42]",
    success: "border-[#c9dec9] bg-[#f4fbf4] text-[#2f6b43]",
    danger: "border-[#efc2bf] bg-[#fff3f1] text-[#a53d38]",
    warning: "border-[#ecd8b9] bg-[#fff8ee] text-[#8a6432]",
    info: "border-[#cbd7f3] bg-[#f4f7ff] text-[#34508f]",
    contrast: "border-white/12 bg-white/8 text-[#f5ddd0]",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function HeroAsidePanel({ children, className = "" }) {
  return (
    <AdminSurface tone="overlay" className={cn("h-full", className)}>
      {children}
    </AdminSurface>
  );
}

export function HeroStatCard({
  label,
  value,
  description,
  className = "",
  labelClassName = "",
  descriptionClassName = "",
  valueClassName = "",
}) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-[#d39a7b]/20 bg-[linear-gradient(180deg,rgba(255,239,227,0.12),rgba(255,255,255,0.05))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,250,246,0.08)]",
        className
      )}
    >
      {label ? (
        <p className={cn("text-sm text-[#f0ddd0]", labelClassName)}>{label}</p>
      ) : null}
      {value !== undefined ? (
        <p
          className={cn(
            "mt-2 font-[family:var(--font-admin-display)] text-4xl text-white",
            valueClassName
          )}
        >
          {value}
        </p>
      ) : null}
      {description ? (
        <p className={cn("mt-1 text-sm leading-6 text-[#ecd6c7]", descriptionClassName)}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function HeroMiniStat({
  label,
  value,
  tone = "warm",
  className = "",
  valueClassName = "",
}) {
  const tones = {
    warm: {
      card:
        "border-[#cf926c]/24 bg-[linear-gradient(180deg,rgba(185,116,79,0.22),rgba(94,61,48,0.22))]",
      label: "text-[#f2c3a4]",
    },
    sand: {
      card:
        "border-[#d1b08c]/24 bg-[linear-gradient(180deg,rgba(164,132,110,0.18),rgba(77,61,49,0.22))]",
      label: "text-[#f0d4bc]",
    },
    rose: {
      card:
        "border-[#cf8f88]/24 bg-[linear-gradient(180deg,rgba(162,100,92,0.2),rgba(84,57,53,0.22))]",
      label: "text-[#f1c1b7]",
    },
    neutral: {
      card:
        "border-[#c59f89]/22 bg-[linear-gradient(180deg,rgba(255,241,230,0.11),rgba(255,255,255,0.04))]",
      label: "text-[#efbf9d]",
    },
  };
  const selectedTone = tones[tone] || tones.warm;

  return (
    <div
      className={cn(
        "rounded-[20px] border px-3 py-3 shadow-[inset_0_1px_0_rgba(255,250,246,0.05)]",
        selectedTone.card,
        className
      )}
    >
      <p className={cn("text-xs uppercase tracking-[0.18em]", selectedTone.label)}>
        {label}
      </p>
      <p className={cn("mt-2 text-2xl font-semibold text-white", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

export function ActionButton({
  children,
  tone = "primary",
  className = "",
  ...props
}) {
  return (
    <button className={cn(buttonClassNames(tone), className)} {...props}>
      {children}
    </button>
  );
}

export function buttonClassNames(tone = "primary") {
  const tones = {
    primary:
      "border border-transparent bg-[#cd754f] text-white shadow-[0_16px_35px_rgba(201,111,77,0.22)] hover:bg-[#bb643f]",
    secondary:
      "border border-[#e4d5c8] bg-white/88 text-[#3a2a23] hover:border-[#d6b9a5] hover:bg-white",
    success:
      "border border-transparent bg-[#3f7f5c] text-white hover:bg-[#356b4d]",
    warning:
      "border border-transparent bg-[#a6793b] text-white hover:bg-[#8d6631]",
    danger:
      "border border-transparent bg-[#a7453f] text-white hover:bg-[#903934]",
    ghost:
      "border border-transparent bg-transparent text-[#7c6354] hover:bg-white/70",
  };

  return cn(
    "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-55",
    tones[tone]
  );
}

export function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="grid gap-2 text-sm text-[#6f5a4f]">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="min-h-12 rounded-2xl border border-[#e4d5c8] bg-white/92 px-4 text-sm text-[#241a16] outline-none transition focus:border-[#c47a53] focus:ring-2 focus:ring-[#f2d4be]"
      >
        {children}
      </select>
    </label>
  );
}

export function PaginationBar({ pageInfo, onPrevious, onNext }) {
  if (!pageInfo || pageInfo.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-[26px] border border-white/70 bg-white/82 px-5 py-4 shadow-[0_24px_70px_rgba(59,38,28,0.06)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a16846]">
          Sayfalama
        </p>
        <p className="mt-1 text-sm text-[#69584d]">
          Sayfa {pageInfo.page} / {pageInfo.totalPages}
        </p>
      </div>

      <div className="flex gap-3">
        <ActionButton
          tone="secondary"
          onClick={onPrevious}
          disabled={!pageInfo.hasPreviousPage}
        >
          Önceki
        </ActionButton>
        <ActionButton
          tone="primary"
          onClick={onNext}
          disabled={!pageInfo.hasNextPage}
        >
          Sonraki
        </ActionButton>
      </div>
    </div>
  );
}

export function DetailModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b1412]/55 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/60 bg-[#fffaf4] shadow-[0_35px_120px_rgba(28,16,11,0.35)]">
        <div className="border-b border-[#ecdccf] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#b06a47]">
                Detay görünümü
              </p>
              <h3 className="font-[family:var(--font-admin-display)] text-3xl text-[#221815]">
                {title}
              </h3>
              {subtitle ? (
                <p className="max-w-2xl text-sm leading-6 text-[#6f5a4f]">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <ActionButton tone="secondary" onClick={onClose}>
              Kapat
            </ActionButton>
          </div>
        </div>

        <div className="max-h-[72vh] overflow-y-auto px-6 py-6 sm:px-8">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-[#ecdccf] bg-white/72 px-6 py-5 sm:px-8">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function InfoSection({ title, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9d6241]">
        {title}
      </h4>
      <div className="overflow-hidden rounded-[24px] border border-[#eadccf] bg-white/85">
        {children}
      </div>
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="grid gap-2 border-b border-[#f0e4d8] px-5 py-4 text-sm last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)]">
      <p className="font-semibold uppercase tracking-[0.12em] text-[#8a7668]">
        {label}
      </p>
      <p className="whitespace-pre-wrap leading-6 text-[#2b201c]">{value || "-"}</p>
    </div>
  );
}
