'use client';

import { FiEdit2 } from 'react-icons/fi';

interface EditButtonProps {
  onClick: () => void;
  isEditing?: boolean;
}

export default function EditButton({ onClick, isEditing = false }: EditButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-2 rounded-lg transition-colors
        ${isEditing 
          ? 'bg-gray-100 text-gray-600' 
          : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
        }
      `}
      title="Editar Ata"
    >
      <FiEdit2 className="w-5 h-5" />
      <span className="ml-2 text-sm font-medium">
        {isEditing ? 'Editando...' : 'Editar Ata'}
      </span>
    </button>
  );
} 