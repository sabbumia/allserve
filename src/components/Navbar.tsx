'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/wer', label: 'WER' },
    { href: '/process', label: 'Post Process' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:opacity-80 transition"
          >
            AllInOne
          </Link>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            {navLinks.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

