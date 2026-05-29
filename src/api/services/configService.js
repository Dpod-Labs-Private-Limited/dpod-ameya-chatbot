import { createTheme } from '@mui/material/styles';
import defaultTheme from '../../styles/theme';

class ThemeConfigService {
    async fetchThemeConfig(config) {
        try {

            return createTheme({
                palette: {
                    primary: {
                        main: config?.background_color ?? defaultTheme.palette.primary.main,
                        light: config?.primary_light ?? defaultTheme.palette.primary.light,
                        dark: config?.question_bubble_color ?? defaultTheme.palette.primary.dark,
                    },
                    secondary: {
                        main: config?.surface_color ?? defaultTheme.palette.secondary.main,
                        dark: config?.secondary_dark ?? defaultTheme.palette.secondary.dark
                    },
                    action: {
                        active: config?.button_fill ?? defaultTheme.palette.action.active,
                        hover: config?.action_hover ?? defaultTheme.palette.action.hover,
                        focus: config?.surface_border ?? defaultTheme.palette.action.focus,
                    },
                    text: {
                        primary: config?.button_text ?? defaultTheme.palette.text.primary,
                        secondary: config?.question_bubble_font_color ?? defaultTheme.palette.text.secondary,
                    }
                },

                typography: {
                    fontFamily: config?.font_family || 'Arial, sans-serif',
                    defaultFontStyle: {
                        fontFamily: config?.fallback_font_family || 'Helvetica, sans-serif',
                    },
                    h1: {
                        fontSize: config?.typography?.h1?.fontSize ?? defaultTheme.typography.h1.fontSize,
                        fontWeight: config?.typography?.h1?.fontWeight ?? defaultTheme.typography.h1.fontWeight,
                        color: config?.font?.font_color ?? defaultTheme.typography.h1.color
                    },
                    h2: {
                        fontSize: config?.typography?.h2?.fontSize ?? defaultTheme.typography.h2.fontSize,
                        fontWeight: config?.typography?.h2?.fontWeight ?? defaultTheme.typography.h2.fontWeight,
                        color: config?.font?.font_color ?? defaultTheme.typography.h2.color
                    },
                    h3: {
                        fontSize: config?.typography?.h3?.fontSize ?? defaultTheme.typography.h3.fontSize,
                        fontWeight: config?.typography?.h3?.fontWeight ?? defaultTheme.typography.h3.fontWeight,
                        color: config?.font?.font_color ?? defaultTheme.typography.h3.color
                    },
                    h4: {
                        fontSize: config?.typography?.h4?.fontSize ?? defaultTheme.typography.h4.fontSize,
                        fontWeight: config?.typography?.h4?.fontWeight ?? defaultTheme.typography.h4.fontWeight,
                        color: config?.font?.font_color ?? defaultTheme.typography.h4.color
                    },
                    h5: {
                        fontSize: config?.typography?.h5?.fontSize ?? defaultTheme.typography.h5.fontSize,
                        fontWeight: config?.typography?.h5?.fontWeight ?? defaultTheme.typography.h5.fontWeight,
                        color: config?.font?.font_color ?? defaultTheme.typography.h5.color
                    },
                    h6: {
                        fontSize: config?.typography?.h6?.fontSize ?? defaultTheme.typography.h6.fontSize,
                        fontWeight: config?.typography?.h6?.fontWeight ?? defaultTheme.typography.h6.fontWeight,
                        color: config?.font?.font_color ?? defaultTheme.typography.h6.color
                    },
                    body1: {
                        fontSize: config?.typography?.body1?.fontSize,
                        fontWeight: config?.typography?.body1?.fontWeight,
                        color: config?.font?.font_color ?? defaultTheme.typography.body1.color
                    },
                    body2: {
                        fontSize: config?.typography?.body2?.fontSize,
                        fontWeight: config?.typography?.body2?.fontWeight,
                        color: config?.font?.font_color ?? defaultTheme.typography.body2.color
                    },
                    primaryButton: {
                        fontSize: config?.button?.primaryButton?.fontSize,
                        fontWeight: config?.button?.primaryButton?.fontWeight,
                        textTransform: 'none',
                    },
                    secondaryButton: {
                        fontSize: config?.button?.secondaryButton?.fontSize,
                        fontWeight: config?.button?.secondaryButton?.fontWeight,
                        textTransform: 'none'
                    }
                },
            });

        } catch (error) {
            console.error('Failed to fetch theme config:', error);
            return null;
        }
    }

}

const configService = new ThemeConfigService();
export default configService;
