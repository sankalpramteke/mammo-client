'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard',    href: '/dashboard', icon: '▦' },
  { label: 'New Scan',     href: '/scan',      icon: '⊕' },
  { label: 'Scan History', href: '/history',   icon: '≡' },
  { label: 'Reports',      href: '/reports',   icon: '⊟' },
  { label: 'Help',         href: '/help',      icon: '?' },
];

export default function DishNavbar() {
  const pathname = usePathname();

  return (
    <nav style={{ background: '#1a3a6b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
        <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '11px 18px',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    borderBottom: isActive ? '2.5px solid #f59e0b' : '2.5px solid transparent',
                    transition: 'all 0.18s ease',
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.2px',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'white';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: 14, opacity: 0.8 }}>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
