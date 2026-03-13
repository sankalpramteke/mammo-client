'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'New Scan', href: '/scan' },
  { label: 'Scan History', href: '/history' },
  { label: 'Reports', href: '/reports' },
  { label: 'Help', href: '/help' },
];

export default function GovNavbar() {
  const pathname = usePathname();

  return (
    <nav style={{ background: '#2c5f9e', borderBottom: '2px solid #1a3a6b' }}>
      <div className="max-w-screen-xl mx-auto px-4">
        <ul className="flex items-center gap-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-5 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    color: isActive ? '#1a3a6b' : '#ffffff',
                    background: isActive ? '#f7941d' : 'transparent',
                    borderRight: '1px solid rgba(255,255,255,0.15)',
                    letterSpacing: '0.2px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
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
