const formatRecurrence = (meeting: Meeting) => {
  if (!meeting.isRecurring) return '';

  const types = {
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    monthly: 'Mensalmente',
  };

  return `${types[meeting.recurrenceType as keyof typeof types]} até ${
    meeting.recurrenceEndDate?.toLocaleDateString('pt-BR')
  }`;
}; 