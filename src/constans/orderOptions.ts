// Definir una interfaz para las opciones de ordenamiento
interface OrderOption {
    label: string;
    value: string;
    icon: string;
}

export const orderOptions: OrderOption[] = [
    {
        label: "Mayor a menor",
        value: "MAYOR_MENOR",
        icon: "chevron-down-circle-sharp"
    },
    {
        label: "Menor a mayor",
        value: "MENOR_MAYOR",
        icon: "chevron-up-circle-sharp"
    },
    {
        label: "Usuario A-Z",
        value: "AZ",
        icon: "text"
    },
    {
        label: "Usuario Z-A",
        value: "ZA",
        icon: "text"
    }
];

// También podemos exportar el tipo para usarlo en el componente si es necesario
export type OrderOptionValue = 'MAYOR_MENOR' | 'MENOR_MAYOR' | 'AZ' | 'ZA';