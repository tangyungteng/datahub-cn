import { PlusOutlined } from '@ant-design/icons';
import { Button, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';

import { useUserContext } from '@app/context/useUserContext';
import { sortGlossaryNodes } from '@app/entity/glossaryNode/utils';
import { sortGlossaryTerms } from '@app/entity/glossaryTerm/utils';
import CreateGlossaryEntityModal from '@app/entity/shared/EntityDropdown/CreateGlossaryEntityModal';
import TabToolbar from '@app/entity/shared/components/styled/TabToolbar';
import { useGlossaryEntityData } from '@app/entityV2/shared/GlossaryEntityContext';
import EmptyGlossarySection from '@app/glossary/EmptyGlossarySection';
import GlossaryEntitiesList from '@app/glossary/GlossaryEntitiesList';
import useToggleSidebar from '@app/glossary/useToggleSidebar';
import { OnboardingTour } from '@app/onboarding/OnboardingTour';
import {
    BUSINESS_GLOSSARY_CREATE_TERM_GROUP_ID,
    BUSINESS_GLOSSARY_CREATE_TERM_ID,
    BUSINESS_GLOSSARY_INTRO_ID,
} from '@app/onboarding/config/BusinessGlossaryOnboardingConfig';
import ToggleSidebarButton from '@app/search/ToggleSidebarButton';
import { Message } from '@app/shared/Message';
import { useEntityRegistry } from '@app/useEntityRegistry';

import { useGetRootGlossaryNodesQuery, useGetRootGlossaryTermsQuery } from '@graphql/glossary.generated';
import { EntityType } from '@types';

export const HeaderWrapper = styled(TabToolbar)`
    padding: 15px 45px 10px 24px;
    height: auto;
`;

const GlossaryWrapper = styled.div`
    display: flex;
    flex: 1;
    max-height: inherit;
`;

const MainContentWrapper = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
`;

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

export const MAX_BROWSER_WIDTH = 500;
export const MIN_BROWSWER_WIDTH = 200;

function BusinessGlossaryPage() {
    const { t } = useTranslation('common');
    const {
        data: termsData,
        refetch: refetchForTerms,
        loading: termsLoading,
        error: termsError,
    } = useGetRootGlossaryTermsQuery();
    const {
        data: nodesData,
        refetch: refetchForNodes,
        loading: nodesLoading,
        error: nodesError,
    } = useGetRootGlossaryNodesQuery();
    const entityRegistry = useEntityRegistry();
    const { setEntityData } = useGlossaryEntityData();
    const { isOpen: isSidebarOpen, toggleSidebar } = useToggleSidebar();

    useEffect(() => {
        setEntityData(null);
    }, [setEntityData]);

    const terms = termsData?.getRootGlossaryTerms?.terms?.sort((termA, termB) =>
        sortGlossaryTerms(entityRegistry, termA, termB),
    );
    const nodes = nodesData?.getRootGlossaryNodes?.nodes?.sort((nodeA, nodeB) =>
        sortGlossaryNodes(entityRegistry, nodeA, nodeB),
    );

    const hasTermsOrNodes = !!nodes?.length || !!terms?.length;

    const [isCreateTermModalVisible, setIsCreateTermModalVisible] = useState(false);
    const [isCreateNodeModalVisible, setIsCreateNodeModalVisible] = useState(false);

    const user = useUserContext();
    const canManageGlossaries = user?.platformPrivileges?.manageGlossaries;

    return (
        <>
            <OnboardingTour
                stepIds={[
                    BUSINESS_GLOSSARY_INTRO_ID,
                    BUSINESS_GLOSSARY_CREATE_TERM_ID,
                    BUSINESS_GLOSSARY_CREATE_TERM_GROUP_ID,
                ]}
            />
            <GlossaryWrapper>
                {(termsLoading || nodesLoading) && (
                    <Message type="loading" content="Loading Glossary..." style={{ marginTop: '10%' }} />
                )}
                {(termsError || nodesError) && (
                    <Message type="error" content="Failed to load glossary! An unexpected error occurred." />
                )}
                <MainContentWrapper data-testid="glossary-entities-list">
                    <HeaderWrapper>
                        <TitleContainer>
                            <ToggleSidebarButton isOpen={isSidebarOpen} onClick={toggleSidebar} />
                            <Typography.Title style={{ margin: '0' }} level={3}>
                                {t('glossary.title')}
                            </Typography.Title>
                        </TitleContainer>
                        <div>
                            <Button
                                data-testid="add-term-button"
                                id={BUSINESS_GLOSSARY_CREATE_TERM_ID}
                                disabled={!canManageGlossaries}
                                type="text"
                                onClick={() => setIsCreateTermModalVisible(true)}
                            >
                                <PlusOutlined /> {t('glossary.add_term')}
                            </Button>
                            <Button
                                data-testid="add-term-group-button"
                                id={BUSINESS_GLOSSARY_CREATE_TERM_GROUP_ID}
                                disabled={!canManageGlossaries}
                                type="text"
                                onClick={() => setIsCreateNodeModalVisible(true)}
                            >
                                <PlusOutlined /> {t('glossary.add_term_group')}
                            </Button>
                        </div>
                    </HeaderWrapper>
                    {hasTermsOrNodes && <GlossaryEntitiesList nodes={nodes || []} terms={terms || []} />}
                    {!(termsLoading || nodesLoading) && !hasTermsOrNodes && (
                        <EmptyGlossarySection
                            title={t('glossary.empty_title')}
                            description={t('glossary.empty_desc')}
                            refetchForTerms={refetchForTerms}
                            refetchForNodes={refetchForNodes}
                        />
                    )}
                </MainContentWrapper>
            </GlossaryWrapper>
            {isCreateTermModalVisible && (
                <CreateGlossaryEntityModal
                    entityType={EntityType.GlossaryTerm}
                    onClose={() => setIsCreateTermModalVisible(false)}
                    refetchData={refetchForTerms}
                />
            )}
            {isCreateNodeModalVisible && (
                <CreateGlossaryEntityModal
                    entityType={EntityType.GlossaryNode}
                    onClose={() => setIsCreateNodeModalVisible(false)}
                    refetchData={refetchForNodes}
                />
            )}
        </>
    );
}

export default BusinessGlossaryPage;
