import { Tabs } from '@components';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';

import { Tab } from '@components/components/Tabs/Tabs';

import { useBaseEntity, useEntityData, useRouteToTab } from '@app/entity/shared/EntityContext';
import { translateEntityTabName } from '@app/entityV2/shared/tabs/translateEntityTabName';
import { EntityTab, TabContextType, TabRenderType } from '@app/entityV2/shared/types';
import TabFullsizedContext from '@app/shared/TabFullsizedContext';

type Props = {
    tabs: EntityTab[];
    selectedTab?: EntityTab;
};

const TabContent = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
    height: 100%;
`;

export const EntityTabs = <T,>({ tabs, selectedTab }: Props) => {
    const { t } = useTranslation('common');
    const { entityData, loading } = useEntityData();
    const routeToTab = useRouteToTab();
    const baseEntity = useBaseEntity<T>();
    const { isTabFullsize } = useContext(TabFullsizedContext);

    const enabledTabs = tabs.filter((tab) => tab.display?.enabled(entityData, baseEntity));

    useEffect(() => {
        if (!loading && !selectedTab && enabledTabs[0]) {
            routeToTab({ tabName: enabledTabs[0].name, method: 'replace' });
        }
    }, [loading, enabledTabs, selectedTab, routeToTab]);

    const finalTabs: Tab[] = tabs.map((tab) => ({
        key: tab.name,
        name: translateEntityTabName(tab.name, t),
        component: (
            <TabContent>
                <tab.component
                    properties={tab.properties}
                    contextType={TabContextType.PROFILE}
                    renderType={TabRenderType.DEFAULT}
                />
            </TabContent>
        ),
        disabled: !tab.display?.enabled(entityData, baseEntity),
        dataTestId: `${tab.name}-entity-tab-header`,
        count: tab.getCount?.(entityData, baseEntity, loading),
    }));

    return (
        <Tabs
            onChange={(t) => routeToTab({ tabName: t })}
            selectedTab={selectedTab?.name}
            tabs={finalTabs}
            hideTabsHeader={isTabFullsize}
            addPaddingLeft
        />
    );
};
