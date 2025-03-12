export const getFirstDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const getLastDayOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const formatearFecha = (fecha: string): string => {
    const nuevaFecha = new Date(fecha);
    const dia = nuevaFecha.getDate().toString().padStart(2, '0');
    const mes = (nuevaFecha.getMonth() + 1).toString().padStart(2, '0');
    const año = nuevaFecha.getFullYear();
    return `${dia}-${mes}-${año}`;
};