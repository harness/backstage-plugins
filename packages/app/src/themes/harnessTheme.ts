import { BackstageOverrides } from '@backstage/core-components';
import { BackstageOverrides as CatalogReactOverrides } from '@backstage/plugin-catalog-react';
import { BackstageTheme, createTheme, lightTheme } from '@backstage/theme';

const baseTheme = createTheme({
  palette: {
    ...lightTheme.palette,
    primary: {
      main: '#0052CC',
      light: '#4C9AFF',
      dark: '#172B4D',
    },
    secondary: {
      main: '#FF5630',
      light: '#FFAB00',
      dark: '#6554C0',
    },
    grey: {
      50: '#fafbfc',
      100: '#f3f3fa',
      200: '#d9dae5',
      300: '#b0b1c4',
      400: '#9293ab',
      500: '#6b6d85',
      600: '#4f5162',
      700: '#383946',
      800: '#22222a',
      900: '#0b0b0d',
    },
    error: {
      main: '#b41710',
      light: '#e43326',
      dark: '#ef9790',
    },
    warning: {
      main: '#ff5310',
      light: '#ff7020',
      dark: '#ff5310',
    },
    success: {
      main: '#689f38',
      light: '#79F2C0',
      dark: '#006644',
    },
    info: {
      main: '#0065FF',
      light: '#4C9AFF',
      dark: '#0747A6',
    },
    navigation: {
      ...lightTheme.palette.navigation,
      background: '#07182b',
      color: '#FFFFFF',
      selectedColor: '#ffffff',
      indicator: '#0278d5',
      navItem: {
        hoverBackground: '#0a3364',
      },
    },
    text: {
      primary: '#0b0b0d',
      secondary: '#6b6d85',
      disabled: '#f3f3fa',
    },
    background: {
      default: '#fafcff',
    },
  },
  fontFamily: 'Inter, sans-serif',
  defaultPageTheme: 'home',
});

const createCustomThemeOverrides = (
  theme: BackstageTheme,
): BackstageOverrides & CatalogReactOverrides => {
  return {
    BackstageHeader: {
      header: {
        backgroundImage: 'unset',
        borderBottom: '1px solid #d9dae5',
        boxShadow: 'none',
        backgroundColor: '#ffffff',
        paddingTop: 15,
        paddingBottom: 15,
        height: 73,
      },
      title: {
        color: '#22222a',
        fontWeight: 700,
        fontSize: '20px',
      },
      subtitle: {
        color: '#383946',
        fontWeight: 500,
        fontSize: '14px',
      },
      type: {
        color: theme.palette.primary.dark,
      },
    },
    BackstageSidebarPage: {
      root: {
        paddingLeft: '232px !important',
        '& hr': {
          background: 'rgba(255, 255, 255, 0.1)',
          height: '1px',
          border: 'none',
          margin: '16px 24px 4px 32px',
          width: '128px',
        },
      },
    },
    CatalogReactEntityDisplayName: {
      root: {
        wordBreak: 'break-all',
      },
    },
    BackstageHeaderLabel: {
      label: {
        color: '#0278d5',
      },
      value: {
        color: '#0278d5',
      },
    },

    BackstageSidebar: {
      drawer: {
        overflowX: 'visible',

        '& span.bp3-icon-cross': {
          right: '80px',
        },
      },
    },

    BackstageSidebarDivider: {
      root: {
        background: 'rgba(255, 255, 255, 0.1)',
        height: '1px',
        border: 'none',
        margin: '8px 24px 4px 32px',
        width: '128px',
      },
    },

    BackstageSidebarItem: {
      iconContainer: {
        width: '20px',
        marginLeft: '0px !important',

        '& svg': {
          width: '18px',
        },
      },

      open: {
        width: 'auto !important',
      },

      highlightable: {
        '&:hover': {
          backgroundColor: 'rgba(2, 120, 213, 0.25)',
          color: '#f3f3fa !important',
        },
      },

      buttonItem: {
        height: '36px',
        padding: '8px 16px 8px 16px',
        marginBottom: '2px',
        borderRadius: '4px',
        color: '#b0b1c4',
        width: 'auto',

        '& h6': {
          paddingTop: '0px',
          paddingBottom: '0px',
          color: '#6B6D85',
        },

        '& path': {
          fill: '#6B6D85',
        },

        '& $iconContainer': {
          display: 'inline-block',
          width: '20px',
          marginLeft: '0px',
        },
      },
      root: {
        height: '36px',
        padding: '8px 16px 8px 16px',
        marginBottom: '2px',
        borderRadius: '4px',
        color: '#b0b1c4 !important',
        fontWeight: 400,
        width: 'auto',
        '&:hover': {
          textDecoration: 'none',
        },
      },
      label: {
        padding: '8px 16px',
        marginLeft: '8px',
        fontSize: '13px',
        fontWeight: 'normal',
        color: 'inherit',
        width: '156px',
      },

      secondaryAction: {
        display: 'none',
      },

      selected: {
        backgroundColor: 'rgba(2, 120, 213, 0.25)',
        color: '#3dc7f6 !important',
        borderLeft: 'none !important',
        fontWeight: 500,
      },
    },

    BackstageContentHeader: {
      title: {
        color: '#383946',
        fontWeight: 500,
        fontSize: '18px',
      },
    },
    BackstageHeaderTabs: {
      defaultTab: {
        fontSize: 'inherit',
        textTransform: 'none',
      },
    },
    BackstageOpenedDropdown: {
      icon: {
        '& path': {
          fill: '#FFFFFF',
        },
      },
    },
    BackstageTable: {
      root: {
        '&> :first-child': {
          borderBottom: '1px solid #D5D5D5',
          boxShadow: 'none',
        },
        '& th': {
          borderTop: 'none',
          textTransform: 'none !important',
        },
      },
    },
    CatalogReactUserListPicker: {
      root: {
        backgroundColor: '#ffffff',
      },
      title: {
        textTransform: 'none',
        marginLeft: 0,
      },
      menuItem: {
        color: '#22222a',
      },
    },
    MuiIconButton: {
      label: {
        color: '#b0b1c4',
      },
    },
    MuiBackdrop: {
      root: {
        backgroundColor: 'rgba(9,30,69,0.54)',
      },
    },
    MuiPaper: {
      root: {
        fontSize: 14,
      },
    },
    MuiButton: {
      root: {
        borderRadius: 3,
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
      },
      containedPrimary: {
        color: '#ffffff !important',
        backgroundColor: '#0278d5',
        '&:hover': {
          backgroundColor: '#3dc7f6',
          color: '#ffffff !important',
        },
      },
      containedSecondary: {
        color: '#0278d5',
        backgroundColor: '#ffffff',
      },
      textPrimary: {
        color: '#4f5162',
      },
    },
    MuiChip: {
      root: {
        borderRadius: 4,
        backgroundColor: theme.palette.grey[50],
        color: '#0a3364',
        margin: 4,
        border: '1px solid #d9dae5',
      },
    },
    MuiCard: {
      root: {
        boxShadow: 'none',
        borderRadius: 8,
        border: '1px solid #f3f3fa',
      },
    },
    MuiSelect: {
      root: {
        '&[aria-expanded]': {
          backgroundColor: '#fafcff',
          color: '#383946',
        },
      },
      select: {
        fontSize: 18,
        color: '#22222a',
      },
    },
    MuiSwitch: {
      root: {
        padding: 10,
      },
      switchBase: {
        padding: 12,
      },
      thumb: {
        backgroundColor: '#FFFFFF',
        height: 14,
        width: 14,
      },
      track: {
        borderRadius: 9,
      },
    },
    MuiTabs: {
      indicator: {
        transition: 'none',
      },
    },
    MuiTypography: {
      button: {
        textTransform: 'none',
      },
      h1: {
        fontSize: 28,
        lineHeight: 1.3,
      },
      h2: {
        fontSize: 18,
        lineHeight: 1.3,
      },
      h3: {
        fontSize: 14,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: 12,
        lineHeight: 1.3,
      },
      h5: {
        fontSize: 16,
        lineHeight: 1.3,
        fontWeight: 600,
      },
      h6: {
        fontSize: 14,
        lineHeight: 1.3,
        fontWeight: 600,
      },
    },
    MuiToolbar: {
      root: {
        color: '#22222a',
        fontSize: 16,
        fontWeight: 700,
      },
    },
    MuiBreadcrumbs: {
      ol: {
        color: theme.palette.link,
      },
    },
    BackstageGauge: {
      overlay: {
        fontSize: 'inherit',
        color: 'inherit',
      },
    },
    MuiLink: {
      root: {
        color: '#0278d5',

        '&:hover': {
          color: '#004ba4',
        },
      },
    },
    MuiFormLabel: {
      disabled: {
        color: '#22222a !important',
        opacity: '0.5 !important',
      },
    },
  };
};

export const harnessTheme: BackstageTheme = {
  ...baseTheme,
  overrides: {
    ...baseTheme.overrides,
    ...createCustomThemeOverrides(baseTheme),
  },
};
