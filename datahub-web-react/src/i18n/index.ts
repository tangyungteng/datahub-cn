import dayjs from 'dayjs';
import 'dayjs/locale/zh';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// 导入语言包
import enAuth from '@i18n/locales/en/auth.json';
import enCommon from '@i18n/locales/en/common.json';
import enEntity from '@i18n/locales/en/entity.json';
import enMessages from '@i18n/locales/en/messages.json';
import enSearch from '@i18n/locales/en/search.json';
import enSettings from '@i18n/locales/en/settings.json';
import zhAuth from '@i18n/locales/zh/auth.json';
import zhCommon from '@i18n/locales/zh/common.json';
import zhEntity from '@i18n/locales/zh/entity.json';
import zhMessages from '@i18n/locales/zh/messages.json';
import zhSearch from '@i18n/locales/zh/search.json';
import zhSettings from '@i18n/locales/zh/settings.json';

const resources = {
    en: {
        common: enCommon,
        auth: enAuth,
        search: enSearch,
        entity: enEntity,
        settings: enSettings,
        messages: enMessages,
    },
    zh: {
        common: zhCommon,
        auth: zhAuth,
        search: zhSearch,
        entity: zhEntity,
        settings: zhSettings,
        messages: zhMessages,
    },
};

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        defaultNS: 'common',
        lng: 'zh', // 默认中文
        keySeparator: '.', // 使用 . 解析嵌套 key（如 home.good_evening）
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'datahub-language',
        },
    });

// 同步 dayjs locale 与 i18n 语言设置
function syncDayjsLocale(lng: string) {
    if (lng === 'zh') {
        dayjs.locale('zh');
    } else {
        dayjs.locale('en');
    }
}

syncDayjsLocale(i18n.language || 'zh');
i18n.on('languageChanged', syncDayjsLocale);

export default i18n;
