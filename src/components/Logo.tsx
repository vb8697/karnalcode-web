import Link from "next/link";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="KarnalCode logo">
      <rect x="4" y="4" width="92" height="84" rx="26" fill="#c2410c" />
      <path d="M16 84 L12 98 L38 88z" fill="#c2410c" />
      <path d="M38 32 L20 47 L38 62" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M62 32 L80 47 L62 62" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="50" cy="47" r="6" fill="#ffc93c" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-2xl font-extrabold tracking-tight">
        Karnal<span className="text-primary">Code</span>
      </span>
    </Link>
  );
}
