import { format, subDays, differenceInDays, addDays, parseISO } from "date-fns";

const generateDateArray = (startStr, endStr) => {
  try {
    const start = parseISO(startStr);
    const end = parseISO(endStr);
    const daysCount = differenceInDays(end, start) + 1;
    console.log("daysCount:", daysCount);
    return Array.from({ length: daysCount }, (_, i) => {
      return format(addDays(start, i), 'yyyy-MM-dd');
    });
  } catch (e) {
    console.error(e);
    return [];
  }
};

console.log("Generated array:", generateDateArray('2026-05-17', '2026-05-30'));
