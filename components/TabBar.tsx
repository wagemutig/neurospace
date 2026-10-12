import Link from "next/link";

type Tab = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const tabs: Tab[] = [
  {
    href: "/",
    label: "Heute",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 11 L12 4 L20 11 V20 H4 Z" />
      </svg>
    ),
  },
  {
    href: "/uebung",
    label: "Übung",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    href: "/verlauf",
    label: "Verlauf",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M5 20 V12 M12 20 V6 M19 20 V14" />
      </svg>
    ),
  },
];

export function TabBar({ current }: { current: string }) {
  return (
    <nav className="tabs" aria-label="Hauptnavigation">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-label={tab.label}
          aria-current={current === tab.href ? "page" : undefined}
        >
          {tab.icon}
        </Link>
      ))}
    </nav>
  );
}
