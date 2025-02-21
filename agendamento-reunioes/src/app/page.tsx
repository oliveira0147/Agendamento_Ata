'use client';

import { useRouter } from 'next/navigation';
import { FiCalendar, FiFileText, FiUsers, FiSettings } from 'react-icons/fi';

export default function HomePage() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Reuniões',
      description: 'Agende e gerencie suas reuniões',
      icon: <FiCalendar className="w-8 h-8" />,
      path: '/meetings',
      color: 'bg-teal-500'
    },
    {
      title: 'Atas Livres',
      description: 'Crie e visualize atas independentes',
      icon: <FiFileText className="w-8 h-8" />,
      path: '/minutes/free',
      color: 'bg-blue-500'
    },
    {
      title: 'Usuários',
      description: 'Gerencie participantes',
      icon: <FiUsers className="w-8 h-8" />,
      path: '/users',
      color: 'bg-purple-500'
    },
    {
      title: 'Configurações',
      description: 'Configure seu perfil e preferências',
      icon: <FiSettings className="w-8 h-8" />,
      path: '/profile',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Sistema de Gestão de Reuniões
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className={`${item.color} text-white p-3 rounded-lg inline-block`}>
                  {item.icon}
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Seção de Ações Rápidas */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Ações Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/meetings/new')}
              className="flex items-center justify-center p-4 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <FiCalendar className="w-5 h-5 mr-2" />
              Nova Reunião
            </button>
            <button
              onClick={() => router.push('/minutes/free/new')}
              className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FiFileText className="w-5 h-5 mr-2" />
              Nova Ata Livre
            </button>
            <button
              onClick={() => router.push('/meetings/all')}
              className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FiCalendar className="w-5 h-5 mr-2" />
              Ver Todas as Reuniões
            </button>
          </div>
        </div>

        {/* Seção de Estatísticas */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">
              Reuniões de Hoje
            </h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">
              Atas Pendentes
            </h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">
              Total de Reuniões
            </h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
