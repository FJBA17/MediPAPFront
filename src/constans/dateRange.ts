import { DateRange } from '../types/reportes.types';
import { getFirstDayOfMonth, getLastDayOfMonth } from '../utils/date.utils';

export const dateRanges: DateRange[] = [
    {
        label: "Semana actual",
        getValue: () => {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            return { start, end: now };
        },
        icon: "time"
    },
    {
        label: "Mes actual",
        getValue: () => {
            const now = new Date();
            return {
                start: getFirstDayOfMonth(now),
                end: now
            };
        },
        icon: "calendar-clear"
    },
    {
        label: "Mes pasado",
        getValue: () => {
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return {
                start: getFirstDayOfMonth(lastMonth),
                end: getLastDayOfMonth(lastMonth)
            };
        },
        icon: "calendar-number"
    },
    {
        label: "3 Meses",
        getValue: () => {
            const now = new Date();
            const start = new Date(now);
            start.setMonth(now.getMonth() - 3);
            return { start, end: now };
        },
        icon: "document-text"
    },
    {
        label: "6 Meses",
        getValue: () => {
            const now = new Date();
            const start = new Date(now);
            start.setMonth(now.getMonth() - 6);
            return { start, end: now };
        },
        icon: "documents"
    },
    {
        label: "1 Año",
        getValue: () => {
            const now = new Date();
            
            const start = new Date(now);
            start.setFullYear(now.getFullYear() - 1);
    
            // Normalizar fechas
            start.setHours(0, 0, 0, 0);
            now.setHours(23, 59, 59, 999);

            return { start, end: now };
        },
        icon: "hourglass"
    }
];