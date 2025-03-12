export interface HistorialItem {
    resultadoPAP: string;
    userName: string;
    nombreuser: string;
    apellidouser: string;
    rutBuscado: string;
    fecha: string;
    nombrepaciente: string;
}

export interface ApiResponse {
    historial: HistorialItem[];
}

export interface Busqueda {
    rut: string;
    fecha: string;
    estado: string;
    nombrepaciente: string;
}

export interface Usuario {
    userName: string;
    count: number;
    activos: number;
    inactivos: number;
    noEncontrados: number;
    nombre: string;
    apellido: string;
    busquedas: Busqueda[];
}

export interface UsuarioBuscado {
    count: number;
    activos: number;
    inactivos: number;
    noEncontrados: number;
    nombreuser: string;
    apellidouser: string;
    busquedas: Busqueda[];
}

export interface AcumuladorUsuarios {
    [key: string]: UsuarioBuscado;
}

export interface DateRange {
    label: string;
    getValue: () => { start: Date; end: Date };
    icon?: string;
}