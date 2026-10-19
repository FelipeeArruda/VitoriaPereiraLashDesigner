import { addMinutes, isBefore, isAfter, parseISO, format } from 'date-fns';

export function getAvailableSlots(dateStr, existingAppointments, serviceDurationMinutes) {
  const slots = [];
  // Horário de funcionamento: das 08:00 às 18:00
  const startOfDay = new Date(`${dateStr}T08:00:00`);
  const endOfDay = new Date(`${dateStr}T18:00:00`);
  
  let currentSlot = startOfDay;

  while (isBefore(addMinutes(currentSlot, serviceDurationMinutes), endOfDay) || 
         +addMinutes(currentSlot, serviceDurationMinutes) === +endOfDay) {
    
    const slotEnd = addMinutes(currentSlot, serviceDurationMinutes);

    const hasCollision = existingAppointments.some(appt => {
      const apptStart = parseISO(appt.start_time);
      const apptEnd = parseISO(appt.end_time);
      return (isBefore(currentSlot, apptEnd) && isAfter(slotEnd, apptStart));
    });

    if (!hasCollision) {
      slots.push(format(currentSlot, 'HH:mm'));
    }

    currentSlot = addMinutes(currentSlot, 30);
  }

  return slots;
}