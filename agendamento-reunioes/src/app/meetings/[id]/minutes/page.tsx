import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import MinutesForm from '@/components/MinutesForm';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function CreateMinutesPage({ params }: PageProps) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { 
        id: params.id 
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!meeting) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm">
          <MinutesForm meeting={meeting} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erro ao carregar reunião:', error);
    return (
      <div className="container mx-auto px-4 py-8 text-red-600">
        Erro ao carregar dados da reunião
      </div>
    );
  }
} 