'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuccessMessage from './SuccessMessage';
import { User } from '@prisma/client';

interface BusySlot {
  id: string;
  title: string;
  start: string;
  end: string;
  duration: number;
}

// Primeiro, vamos criar um tipo para as salas e uma função auxiliar
type Room = {
  id: 'small' | 'medium' | 'large';
  name: string;
  capacity: string;
  description: string;
};

const ROOMS: Room[] = [
  {
    id: 'small',
    name: 'Sala Pequena',
    capacity: 'até 5 pessoas',
    description: 'Ideal para reuniões menores e entrevistas'
  },
  {
    id: 'medium',
    name: 'Sala Média',
    capacity: 'até 10 pessoas',
    description: 'Perfeita para reuniões departamentais'
  },
  {
    id: 'large',
    name: 'Sala Grande',
    capacity: 'até 20 pessoas',
    description: 'Adequada para apresentações e workshops'
  }
];

// Função auxiliar para obter o nome da sala pelo ID
const getRoomNameById = (roomId: string): string => {
  const room = ROOMS.find(room => room.id === roomId);
  return room ? room.name : roomId;
};

// Adicione esta função auxiliar no início do arquivo
const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '';
  
  // Ajusta a data para o fuso horário local
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo'
  }).format(date);
};

interface FormData {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  roomId: string;
  isRecurring: boolean;
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'none';
  recurrenceEndDate: string;
  participantIds: string[];
  viewerIds: string[];
}

export default function NewMeetingForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    duration: 1,
    roomId: '',
    isRecurring: false,
    recurrenceType: 'none',
    recurrenceEndDate: '',
    participantIds: [],
    viewerIds: [],
  });
  const [timeSlots, setTimeSlots] = useState<Array<{
    time: string;
    available: boolean;
    title?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Evitar problemas de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (formData.startDate && formData.roomId) {
      fetchAvailability();
    }
  }, [formData.startDate, formData.roomId]);

  useEffect(() => {
    const fetchBusySlots = async () => {
      if (!formData.startDate || !formData.roomId) {
        setBusySlots([]); // Limpa os slots quando não há data ou sala selecionada
        return;
      }

      try {
        const response = await fetch(
          `/api/availability?date=${formData.startDate}&roomId=${formData.roomId}`
        );
        
        if (!response.ok) {
          throw new Error('Erro ao buscar horários');
        }

        const data = await response.json();
        setBusySlots(data.busySlots || []); // Garante que sempre será um array
      } catch (error) {
        console.error('Erro ao buscar horários:', error);
        setBusySlots([]); // Em caso de erro, mantém como array vazio
      }
    };

    fetchBusySlots();
  }, [formData.startDate, formData.roomId]);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(
        `/api/availability?date=${formData.startDate}&roomId=${formData.roomId}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar disponibilidade');
      }
      
      setTimeSlots(data.slots || []); // Garante que sempre será um array
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
      setTimeSlots([]); // Em caso de erro, mantém como array vazio
    }
  };

  const checkTimeConflict = (startTime: string, duration: number): boolean => {
    if (!Array.isArray(busySlots) || busySlots.length === 0) {
      return false;
    }

    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration * 60;

    return busySlots.some(slot => {
      if (!slot || !slot.start || !slot.end) return false;

      const [slotStartHours, slotStartMinutes] = slot.start.split(':').map(Number);
      const [slotEndHours, slotEndMinutes] = slot.end.split(':').map(Number);
      
      const slotStartTotal = slotStartHours * 60 + slotStartMinutes;
      const slotEndTotal = slotEndHours * 60 + slotEndMinutes;

      return (
        (startMinutes >= slotStartTotal && startMinutes < slotEndTotal) ||
        (endMinutes > slotStartTotal && endMinutes <= slotEndTotal) ||
        (startMinutes <= slotStartTotal && endMinutes >= slotEndTotal)
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.roomId || !formData.startTime || !formData.title) {
      setErrorMessage('Todos os campos são obrigatórios');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          date: formData.startDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          roomId: formData.roomId,
          roomName: getRoomNameById(formData.roomId),
          isRecurring: formData.isRecurring,
          recurrenceType: formData.isRecurring ? formData.recurrenceType : null,
          recurrenceEndDate: formData.isRecurring ? formData.recurrenceEndDate : null,
          participantIds: formData.participantIds,
          viewerIds: formData.viewerIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar reunião');
      }

      setShowSuccess(true);
    } catch (error) {
      console.error('Erro:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao criar reunião');
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para gerar array de datas
  const getDatesInRange = (startDate: string, endDate: string): string[] => {
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (currentDate <= lastDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Função para gerar datas recorrentes
  const getRecurringDates = (): string[] => {
    if (!formData.isRecurring) {
      return getDatesInRange(formData.startDate, formData.endDate);
    }

    const dates: string[] = [];
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.recurrenceEndDate);
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const shouldInclude = formData.recurrenceType === 'daily' ||
        (formData.recurrenceType === 'weekly' && dayOfWeek === startDate.getDay()) ||
        (formData.recurrenceType === 'monthly' && currentDate.getDate() === startDate.getDate());

      if (shouldInclude) {
        dates.push(currentDate.toISOString().split('T')[0]);
      }

      // Avança para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // Função para verificar conflitos em uma data específica
  const checkDateConflict = async (date: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/availability?date=${date}&roomId=${formData.roomId}`
      );
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao verificar disponibilidade');
      }

      return data.busySlots?.some((slot: BusySlot) => 
        checkTimeConflict(formData.startTime, formData.duration)
      ) || false;
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return true;
    }
  };

  // Função para verificar se o horário já passou
  const isTimeInPast = (time: string): boolean => {
    if (!formData.startDate) return false;

    // Cria data atual no fuso horário local
    const now = new Date();
    
    // Cria data selecionada no fuso horário local
    const [year, month, day] = formData.startDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day); // mês é 0-based
    
    // Cria data atual sem horário para comparação de dias
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDateStart = new Date(year, month - 1, day);

    // Se a data for no passado, bloqueia todos os horários
    if (selectedDateStart < todayStart) {
      return true;
    }

    // Se a data for no futuro, libera todos os horários
    if (selectedDateStart > todayStart) {
      return false;
    }

    // Se for hoje, verifica o horário
    const [hours, minutes] = time.split(':').map(Number);
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Compara horários
    if (hours < currentHours) return true;
    if (hours === currentHours && minutes <= currentMinutes) return true;

    return false;
  };

  // Buscar usuários ao carregar o componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
      }
    };

    fetchUsers();
  }, []);

  if (!mounted) {
    return null; // Evita renderização no servidor
  }

  const renderBusySlots = () => {
    if (!Array.isArray(busySlots) || busySlots.length === 0) {
      return (
        <div className="mt-4 text-sm text-gray-600">
          Nenhum horário ocupado nesta data.
        </div>
      );
    }

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Horários já ocupados nesta data:
        </h3>
        <div className="space-y-2">
          {busySlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-yellow-50 border border-yellow-100 rounded p-2 text-sm text-yellow-800"
            >
              {slot.title} - {slot.start} às {slot.end} - {getRoomNameById(formData.roomId)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    return (endTotal - startTotal) / 60;
  };

  const isTimeInRange = (time: string, start: string, end: string): boolean => {
    const timeMinutes = timeToMinutes(time);
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const renderTimeSlots = () => {
    if (!formData.startDate || !formData.roomId) return null;

    // Verifica se todos os slots estão ocupados
    const hasAvailableSlots = timeSlots.some(slot => slot.available);

    if (!hasAvailableSlots) {
      return (
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-yellow-800">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col">
              <span className="font-medium">
                Não há horários disponíveis para esta data.
              </span>
              <span className="text-sm mt-1">
                Por favor, selecione outra data ou sala para agendar sua reunião.
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Se houver horários disponíveis mas nenhum após o horário selecionado
    if (formData.startTime) {
      const availableEndTimes = timeSlots.filter(slot => 
        timeToMinutes(slot.time) > timeToMinutes(formData.startTime) &&
        slot.available &&
        slot.time <= '18:00'
      );

      if (availableEndTimes.length === 0) {
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-yellow-800">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-medium">
                    Não há horários disponíveis após {formData.startTime}.
                  </span>
                  <span className="text-sm mt-1">
                    Por favor, selecione outro horário de início ou outra data.
                  </span>
                </div>
              </div>
            </div>
            
            {/* Mantém o select de horário inicial visível para permitir mudança */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horário de Início
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => {
                  const newStartTime = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    startTime: newStartTime,
                    endTime: '',
                  }));
                }}
                className="w-full rounded-lg border-gray-300"
              >
                <option value="">Selecione o horário de início</option>
                {timeSlots
                  .filter(slot => slot.time <= '18:00')
                  .map((slot, index) => {
                    const isPast = isTimeInPast(slot.time);
                    return (
                      <option 
                        key={index}
                        value={slot.time}
                        disabled={!slot.available || isPast || (slot.time === '18:00' && !slot.available)}
                      >
                        {slot.time}
                        {isPast ? ' (Horário já passou)' : ''}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
        );
      }
    }

    // Renderização normal dos selects de horário
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horário de Início
          </label>
          <select
            value={formData.startTime}
            onChange={(e) => {
              const newStartTime = e.target.value;
              setFormData(prev => ({
                ...prev,
                startTime: newStartTime,
                endTime: '',
              }));
            }}
            className="w-full rounded-lg border-gray-300"
          >
            <option value="">Selecione o horário de início</option>
            {timeSlots
              .filter(slot => slot.time <= '18:00')
              .map((slot, index) => {
                const isPast = isTimeInPast(slot.time);
                return (
                  <option 
                    key={index}
                    value={slot.time}
                    disabled={!slot.available || isPast || (slot.time === '18:00' && !slot.available)}
                  >
                    {slot.time}
                    {isPast ? ' (Horário já passou)' : ''}
                  </option>
                );
              })}
          </select>
        </div>

        {formData.startTime && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horário de Término
            </label>
            <select
              value={formData.endTime}
              onChange={(e) => {
                const newEndTime = e.target.value;
                const duration = calculateDuration(formData.startTime, newEndTime);
                setFormData(prev => ({
                  ...prev,
                  endTime: newEndTime,
                  duration,
                }));
              }}
              className="w-full rounded-lg border-gray-300"
            >
              <option value="">Selecione o horário de término</option>
              {timeSlots
                .filter(slot => 
                  timeToMinutes(slot.time) > timeToMinutes(formData.startTime) &&
                  slot.available &&
                  slot.time <= '18:00' &&
                  !isTimeInPast(slot.time)
                )
                .map((slot, index) => (
                  <option 
                    key={index}
                    value={slot.time}
                  >
                    {slot.time}
                  </option>
                ))}
            </select>
          </div>
        )}

        {formData.startTime && formData.endTime && (
          <div className="text-sm text-gray-600">
            Duração: {calculateDuration(formData.startTime, formData.endTime)} horas
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
            {errorMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título da Reunião
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            />
          </div>

          {/* Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data Inicial
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  min={formatDateForInput(new Date())}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    startDate: e.target.value,
                    endDate: e.target.value // Reseta a data final quando a inicial muda
                  })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                />
                {formData.startDate && (
                  <p className="text-sm text-gray-600">
                    {formatDateForDisplay(formData.startDate)}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data Final
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  min={formData.startDate || formatDateForInput(new Date())}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  required
                />
                {formData.endDate && (
                  <p className="text-sm text-gray-600">
                    {formatDateForDisplay(formData.endDate)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Salas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecione a Sala
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ROOMS.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setFormData({ ...formData, roomId: room.id })}
                  className={`
                    cursor-pointer rounded-lg p-4 border-2 transition-all duration-200
                    ${formData.roomId === room.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-200'
                    }
                  `}
                >
                  <h3 className="font-medium text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{room.capacity}</p>
                  <p className="text-xs text-gray-400 mt-1">{room.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Seleção de Horários */}
          {formData.startDate && formData.roomId && renderTimeSlots()}

          {renderBusySlots()}

          {/* Opções de Recorrência */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  isRecurring: e.target.checked,
                  recurrenceType: e.target.checked ? 'weekly' : 'none'
                })}
                className="h-4 w-4 text-teal-600 rounded border-gray-300"
              />
              <label htmlFor="isRecurring" className="ml-2 text-sm font-medium text-gray-700">
                Reunião Recorrente
              </label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Recorrência
                  </label>
                  <select
                    value={formData.recurrenceType}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      recurrenceType: e.target.value as FormData['recurrenceType']
                    })}
                    className="w-full rounded-lg border-gray-300"
                  >
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente (mesmo dia da semana)</option>
                    <option value="monthly">Mensalmente (mesmo dia do mês)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Final da Recorrência
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={formData.recurrenceEndDate}
                      min={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                      className="w-full rounded-lg border-gray-300"
                      required={formData.isRecurring}
                    />
                    {formData.recurrenceEndDate && (
                      <p className="text-sm text-gray-600">
                        {formatDateForDisplay(formData.recurrenceEndDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Seleção de Participantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participantes da Reunião
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-colors
                    ${formData.participantIds.includes(user.id)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-200'
                    }
                  `}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      participantIds: prev.participantIds.includes(user.id)
                        ? prev.participantIds.filter(id => id !== user.id)
                        : [...prev.participantIds, user.id]
                    }));
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.participantIds.includes(user.id)}
                      onChange={() => {}} // Controlado pelo onClick do div
                      className="h-4 w-4 text-teal-600 rounded border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Seleção de Visualizadores da Ata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuários com Acesso à Ata
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-colors
                    ${formData.viewerIds.includes(user.id)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-200'
                    }
                  `}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      viewerIds: prev.viewerIds.includes(user.id)
                        ? prev.viewerIds.filter(id => id !== user.id)
                        : [...prev.viewerIds, user.id]
                    }));
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.viewerIds.includes(user.id)}
                      onChange={() => {}} // Controlado pelo onClick do div
                      className="h-4 w-4 text-teal-600 rounded border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isLoading || !formData.startTime}
            className={`
              w-full py-2 px-4 rounded-lg transition-colors duration-200
              flex items-center justify-center
              ${isLoading || !formData.startTime
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white'
              }
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Agendando...
              </>
            ) : (
              'Agendar Reunião'
            )}
          </button>
        </div>
      </form>

      {showSuccess && (
        <SuccessMessage 
          message="Reunião agendada com sucesso!" 
          redirectTo="/meetings"
          autoRedirectDelay={3000}
        />
      )}
    </>
  );
} 