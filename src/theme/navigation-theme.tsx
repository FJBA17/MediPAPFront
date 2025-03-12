import { DefaultTheme } from "@react-navigation/native";


export function getNavigationTheme(theme) {
    // console.log({ DefaultTheme })
    return {
        colors: {
            ...DefaultTheme.colors,
            background: theme.colors.background,
            card: theme.colors.background,
            text: theme.colors.primary,            
        },
        // dark:{
        //     ...DefaultTheme.dark,
        // },
        fonts: {
            ...DefaultTheme.fonts
        },
    };
}
