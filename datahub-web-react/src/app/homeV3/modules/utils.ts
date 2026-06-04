import { IconNames } from '@components';

import { DEFAULT_MODULE_ICON, MODULE_TYPE_TO_DESCRIPTION, MODULE_TYPE_TO_ICON } from '@app/homeV3/modules/constants';
import { ModuleInfo } from '@app/homeV3/modules/types';

import { PageModuleFragment } from '@graphql/template.generated';
import { DataHubPageModuleType } from '@types';

export function getModuleType(module: PageModuleFragment): DataHubPageModuleType {
    return module.properties.type;
}

export function getModuleIcon(module: PageModuleFragment): IconNames {
    return MODULE_TYPE_TO_ICON.get(getModuleType(module)) ?? DEFAULT_MODULE_ICON;
}

export function getModuleName(module: PageModuleFragment): string {
    return module.properties.name;
}

// Default home page modules are stored on the backend with English names.
// Map their well-known URNs to i18n keys so the titles can be localized on the frontend.
// Custom (user-created) modules keep their user-provided names untranslated.
export const DEFAULT_MODULE_NAME_I18N_KEYS: Record<string, string> = {
    'urn:li:dataHubPageModule:your_assets': 'home.your_assets',
    'urn:li:dataHubPageModule:top_domains': 'home.domains',
    'urn:li:dataHubPageModule:platforms': 'home.platforms',
};

export function getModuleNameI18nKey(module: PageModuleFragment): string | undefined {
    return DEFAULT_MODULE_NAME_I18N_KEYS[module.urn];
}

export function getModuleDescription(module: PageModuleFragment): string | undefined {
    // TODO: implement getting of the correct description
    return MODULE_TYPE_TO_DESCRIPTION.get(getModuleType(module));
}

export function convertModuleToModuleInfo(module: PageModuleFragment): ModuleInfo {
    return {
        urn: module.urn,
        key: module.urn,
        type: getModuleType(module),
        name: getModuleName(module),
        icon: getModuleIcon(module),
    };
}
