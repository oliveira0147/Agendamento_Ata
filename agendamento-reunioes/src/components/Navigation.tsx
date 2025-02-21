'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex h-16">
          <div className="flex space-x-8">
            <Link
              href="/"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname === '/' 
                  ? 'border-teal-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Início
            </Link>
            <Link
              href="/meetings"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname.startsWith('/meetings')
                  ? 'border-teal-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Reuniões
            </Link>
            <Link
              href="/minutes/free"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                pathname.startsWith('/minutes/free')
                  ? 'border-teal-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Atas Livres
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 