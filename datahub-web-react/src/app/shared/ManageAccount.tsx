import { CaretDownOutlined, GlobalOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import Cookies from 'js-cookie';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import analytics, { EventType } from '@app/analytics';
import { isLoggedInVar } from '@app/auth/checkAuthStatus';
import { useUserContext } from '@app/context/useUserContext';
import { ANTD_GRAY } from '@app/entity/shared/constants';
import { MenuItemStyle } from '@app/entity/view/menu/item/styledComponent';
import CustomAvatar from '@app/shared/avatar/CustomAvatar';
import { useAppConfig } from '@app/useAppConfig';
import { useEntityRegistry } from '@app/useEntityRegistry';
import { GlobalCfg } from '@src/conf';
import { resolveRuntimePath } from '@utils/runtimeBasePath';

import { EntityType } from '@types';

const DownArrow = styled(CaretDownOutlined)`
    vertical-align: -1px;
    font-size: 10px;
    color: ${ANTD_GRAY[7]};
`;

const DropdownWrapper = styled.div`
    align-items: center;
    cursor: pointer;
    display: flex;
`;

interface Props {
    urn: string;
    pictureLink?: string;
    name?: string;
}

const defaultProps = {
    pictureLink: undefined,
};

export const ManageAccount = ({ urn: _urn, pictureLink: _pictureLink, name }: Props) => {
    const entityRegistry = useEntityRegistry();
    const themeConfig = useTheme();
    const { config } = useAppConfig();
    const userContext = useUserContext();
    const { t, i18n } = useTranslation('common');
    const toggleLanguage = () => {
        const newLang = i18n.language === 'zh' ? 'en' : 'zh';
        i18n.changeLanguage(newLang);
    };
    const handleLogout = () => {
        analytics.event({ type: EventType.LogOutEvent });
        isLoggedInVar(false);
        Cookies.remove(GlobalCfg.CLIENT_AUTH_COOKIE);
        userContext.updateLocalState({ selectedViewUrn: undefined });
    };
    const version = config?.appVersion;

    const themeConfigItems = themeConfig.content.menu.items.map((value) => {
        return {
            key: value.label,
            label: (
                <MenuItemStyle key={value.label}>
                    <a
                        href={value.path || ''}
                        target={value.shouldOpenInNewTab ? '_blank' : ''}
                        rel="noopener noreferrer"
                        tabIndex={0}
                    >
                        {value.label}
                    </a>
                </MenuItemStyle>
            ),
        };
    });

    const divider = {
        key: 'divider',
        type: 'divider',
    };

    const items = [
        version
            ? {
                  key: 'version',
                  label: (
                      <MenuItemStyle key="version" disabled style={{ color: '#8C8C8C' }}>
                          {version}
                      </MenuItemStyle>
                  ),
              }
            : null,
        divider,
        {
            key: 'profile',
            label: (
                <MenuItemStyle key="profile">
                    <a
                        href={resolveRuntimePath(`/${entityRegistry.getPathName(EntityType.CorpUser)}/${_urn}`)}
                        rel="noopener noreferrer"
                        tabIndex={0}
                    >
                        {t('account.your_profile')}
                    </a>
                </MenuItemStyle>
            ),
        },
        ...themeConfigItems,
        {
            key: 'graphiQLLink',
            label: (
                <MenuItemStyle key="graphiQLLink">
                    <a href={resolveRuntimePath('/api/graphiql')}>{t('account.graphiql')}</a>
                </MenuItemStyle>
            ),
        },
        {
            key: 'openapiLink',
            label: (
                <MenuItemStyle key="openapiLink">
                    <a href={resolveRuntimePath('/openapi/swagger-ui/index.html')}>{t('account.openapi')}</a>
                </MenuItemStyle>
            ),
        },
        {
            key: 'language',
            label: (
                <MenuItemStyle key="language" onClick={toggleLanguage}>
                    <GlobalOutlined style={{ marginRight: 8 }} />
                    {i18n.language === 'zh' ? t('account.switch_to_english') : t('account.switch_to_chinese')}
                </MenuItemStyle>
            ),
        },
        divider,
        {
            key: 'logout',
            label: (
                <MenuItemStyle danger key="logout" tabIndex={0}>
                    <a href={resolveRuntimePath('/logOut')} onClick={handleLogout} data-testid="log-out-menu-item">
                        {t('account.sign_out')}
                    </a>
                </MenuItemStyle>
            ),
        },
    ];

    return (
        <Dropdown menu={{ items }} trigger={['click']}>
            <DropdownWrapper data-testid="manage-account-menu">
                <CustomAvatar photoUrl={_pictureLink} style={{ marginRight: 4 }} name={name} />
                <DownArrow />
            </DropdownWrapper>
        </Dropdown>
    );
};

ManageAccount.defaultProps = defaultProps;
