'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUser, FiLock, FiClock, FiHelpCircle, FiAlertCircle, FiLogOut } from 'react-icons/fi';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  lastLogin?: Date;
  lastAccess?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  date: Date;
  ip?: string;
  device?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchUserProfile();
    fetchActivityLog();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const response = await fetch('/api/user/activities');
      const data = await response.json();
      setActivities(data.activities);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Cabeçalho do Perfil */}
          <div className="bg-teal-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-teal-700">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user?.name || ''}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <FiUser className="w-full h-full p-4" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                <p className="text-teal-100">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Menu de Navegação */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'personal'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Informações Pessoais
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'activities'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Atividades
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'support'
                    ? 'border-b-2 border-teal-600 text-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Suporte
              </button>
            </nav>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Editar Perfil</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">E-mail</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telefone</label>
                      <input
                        type="tel"
                        value={user?.phone || ''}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                      Salvar Alterações
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Alterar Senha</h2>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Senha Atual</label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nova Senha</label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      />
                    </div>
                    <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                      Alterar Senha
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activities' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900">Atividades Recentes</h2>
                <div className="mt-4 space-y-4">
                  {activities.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">
                          {activity.device} - {activity.ip}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Central de Ajuda</h2>
                  <p className="mt-2 text-gray-600">
                    Encontre respostas para suas dúvidas em nossa documentação.
                  </p>
                  <a
                    href="/help"
                    className="mt-4 inline-flex items-center text-teal-600 hover:text-teal-700"
                  >
                    <FiHelpCircle className="mr-2" />
                    Acessar FAQ
                  </a>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Reportar Problema</h2>
                  <div className="mt-4">
                    <textarea
                      rows={4}
                      placeholder="Descreva o problema encontrado..."
                      className="block w-full rounded-md border-gray-300 shadow-sm"
                    />
                    <button className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                      Enviar Relatório
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé */}
          <div className="border-t border-gray-200 p-6">
            <button
              onClick={handleLogout}
              className="flex items-center text-red-600 hover:text-red-700"
            >
              <FiLogOut className="mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 