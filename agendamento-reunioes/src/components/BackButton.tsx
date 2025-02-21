'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Não mostra o botão na página inicial
  if (pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={() => router.push('/')}
      className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
    >
      <svg 
        className="w-5 h-5 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Voltar para Início
    </button>
  );
} 