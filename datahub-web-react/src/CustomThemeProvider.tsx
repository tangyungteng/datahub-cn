import { ConfigProvider } from 'antd';
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from 'styled-components';

import { useIsThemeV2 } from '@app/useIsThemeV2';
import { useCustomThemeId } from '@app/useSetAppTheme';
import themes from '@conf/theme/themes';
import { Theme } from '@conf/theme/types';
import { CustomThemeContext } from '@src/customThemeContext';

interface Props {
    children: React.ReactNode;
}

const CustomThemeProvider = ({ children }: Props) => {
    // Note: AppConfigContext not provided yet, so both of these calls rely on the DEFAULT_APP_CONFIG
    const isThemeV2 = useIsThemeV2();
    const customThemeId = useCustomThemeId();
    const { i18n } = useTranslation();
    const antdLocale = i18n.language === 'zh' ? zhCN : enUS;

    // Note: If custom theme id is a json file, it will only be loaded later in useSetAppTheme
    const defaultTheme = isThemeV2 ? themes.themeV2 : themes.themeV1;
    const customTheme = customThemeId ? themes[customThemeId] : null;
    const [theme, setTheme] = useState<Theme>(customTheme ?? defaultTheme);

    return (
        <CustomThemeContext.Provider value={{ theme, updateTheme: setTheme }}>
            <ThemeProvider theme={theme}>
                <ConfigProvider locale={antdLocale}>{children}</ConfigProvider>
            </ThemeProvider>
        </CustomThemeContext.Provider>
    );
};

export default CustomThemeProvider;
