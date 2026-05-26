import type { OperatingProfileIcon } from "./landing-data";

type ProfileGlyphProps = {
  kind: OperatingProfileIcon;
};

export default function ProfileGlyph({ kind }: ProfileGlyphProps) {
  const stroke = "stroke-current";

  switch (kind) {
    case "trend":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <path d="M8 33L18 23L25 29L39 15" className={stroke} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 15H39V24" className={stroke} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "stack":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect x="11" y="12" width="26" height="8" rx="2" className={stroke} strokeWidth="2" />
          <rect x="8" y="21" width="32" height="8" rx="2" className={stroke} strokeWidth="2" />
          <rect x="13" y="30" width="22" height="6" rx="2" className={stroke} strokeWidth="2" />
        </svg>
      );
    case "flow":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <path d="M12 16H26C31 16 35 20 35 25V25" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
          <path d="M13 31H22C27 31 31 27 31 22V22" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
          <circle cx="11" cy="16" r="3" className={stroke} strokeWidth="2" />
          <circle cx="13" cy="31" r="3" className={stroke} strokeWidth="2" />
          <circle cx="35" cy="25" r="3" className={stroke} strokeWidth="2" />
        </svg>
      );
    case "route":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <circle cx="12" cy="15" r="3" className={stroke} strokeWidth="2" />
          <circle cx="35" cy="32" r="3" className={stroke} strokeWidth="2" />
          <path d="M15 15H24C30 15 34 19 34 25V29" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
          <path d="M29 29L34 34L39 29" className={stroke} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <path d="M24 10L35 14V22C35 29 30.5 35 24 38C17.5 35 13 29 13 22V14L24 10Z" className={stroke} strokeWidth="2.25" strokeLinejoin="round" />
          <path d="M20 24L23 27L29 21" className={stroke} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "vault":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <rect x="10" y="12" width="28" height="24" rx="4" className={stroke} strokeWidth="2.25" />
          <circle cx="24" cy="24" r="5.5" className={stroke} strokeWidth="2.25" />
          <path d="M24 21V24L26.5 26" className={stroke} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "rails":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <path d="M12 16H36" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
          <path d="M12 24H36" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
          <path d="M12 32H28" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
          <circle cx="33.5" cy="32" r="4.5" className={stroke} strokeWidth="2" />
        </svg>
      );
    case "pie":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <path d="M24 11V24H37C37 16.8 31.2 11 24 11Z" className={stroke} strokeWidth="2.25" strokeLinejoin="round" />
          <path d="M22 13C15.4 14 11 19.1 11 25.2C11 32.4 16.8 38 24 38C30.1 38 35.2 33.8 36.5 27.5H22V13Z" className={stroke} strokeWidth="2.25" strokeLinejoin="round" />
        </svg>
      );
    case "nodes":
      return (
        <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
          <circle cx="13" cy="24" r="3" className={stroke} strokeWidth="2" />
          <circle cx="24" cy="15" r="3" className={stroke} strokeWidth="2" />
          <circle cx="35" cy="24" r="3" className={stroke} strokeWidth="2" />
          <circle cx="24" cy="33" r="3" className={stroke} strokeWidth="2" />
          <path d="M15.5 22L21.5 17" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
          <path d="M26.5 17L32.5 22" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
          <path d="M32.5 26L26.5 31" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
          <path d="M21.5 31L15.5 26" className={stroke} strokeWidth="2.25" strokeLinecap="round" />
        </svg>
      );
  }
}
