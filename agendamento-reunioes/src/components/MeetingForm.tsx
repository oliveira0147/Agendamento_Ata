'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ROOMS = [
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

interface TimeSlot {
  hour: string;
  isAvailable: boolean;
  meeting?: {
    title: string;
    duration: number;
  };
}

export default function MeetingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    duration: 1, // duração em horas
    roomId: '',
  });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Buscar horários disponíveis quando a data ou sala mudar
  useEffect(() => {
    if (formData.date && formData.roomId) {
      fetchAvailableSlots();
    }
  }, [formData.date, formData.roomId]);

  const fetchAvailableSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/availability?date=${formData.date}&roomId=${formData.roomId}`
      );
      const data = await response.json();
      setTimeSlots(data.slots);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      alert('Erro ao carregar horários disponíveis');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar reunião');
      }

      alert('Reunião agendada com sucesso!');
      router.push('/meetings');
      router.refresh();
    } catch (error) {
      console.error('Erro ao criar reunião:', error);
      alert('Erro ao agendar reunião. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
      <div className="space-y-6">
        {/* Título da Reunião */}
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

        {/* Data */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Data
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            required
          />
        </div>

        {/* Seleção de Sala */}
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

        {/* Visualização de Horários */}
        {formData.date && formData.roomId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Horários Disponíveis
            </label>
            {isLoadingSlots ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Carregando horários...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`
                      p-4 rounded-lg border transition-colors duration-200
                      ${slot.isAvailable 
                        ? 'border-gray-200 hover:border-teal-500 cursor-pointer'
                        : 'border-red-200 bg-red-50'
                      }
                      ${formData.startTime === slot.hour ? 'border-teal-500 bg-teal-50' : ''}
                    `}
                    onClick={() => {
                      if (slot.isAvailable) {
                        setFormData({
                          ...formData,
                          startTime: slot.hour,
                        });
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{slot.hour}</span>
                        {slot.meeting && (
                          <div className="mt-1">
                            <p className="text-sm text-gray-600">
                              Reunião: {slot.meeting.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Duração: {slot.meeting.duration}h
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        {slot.isAvailable ? (
                          <span className="text-sm text-teal-600">Disponível</span>
                        ) : (
                          <span className="text-sm text-red-600">Ocupado</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Duração da Reunião */}
        {formData.startTime && (
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duração da Reunião
            </label>
            <select
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              required
            >
              <option value={1}>1 hora</option>
              <option value={2}>2 horas</option>
              <option value={3}>3 horas</option>
              <option value={4}>4 horas</option>
            </select>
          </div>
        )}

        {/* Botão de Submit */}
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
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Agendando...
            </>
          ) : (
            'Agendar Reunião'
          )}
        </button>
      </div>
    </form>
  );
} 