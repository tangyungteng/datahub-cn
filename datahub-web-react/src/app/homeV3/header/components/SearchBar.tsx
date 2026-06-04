import { Button, Icon } from '@components';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import { SearchBarV2 } from '@app/searchV2/searchBarV2/SearchBarV2';
import useGoToSearchPage from '@app/searchV2/useGoToSearchPage';
import useSearchViewAll from '@app/searchV2/useSearchViewAll';
import { useEntityRegistryV2 } from '@app/useEntityRegistry';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const ViewAllContainer = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const StyledButton = styled(Button)`
    padding: 0 8px;
`;

export default function SearchBar() {
    const { t } = useTranslation('search');
    const entityRegistry = useEntityRegistryV2();
    const searchViewAll = useSearchViewAll();
    const search = useGoToSearchPage(null);
    const themeConfig = useTheme();

    const placeholderText = t('bar.placeholder', {
        defaultValue: themeConfig.content.search.searchbarMessage,
    });

    return (
        <Container>
            <SearchBarV2
                placeholderText={placeholderText}
                onSearch={search}
                entityRegistry={entityRegistry}
                width="100%"
                fixAutoComplete
                viewsEnabled
                viewsInPopover={false}
                isShowNavBarRedesign
                showViewAllResults
                combineSiblings
                showCommandK
            />
            <ViewAllContainer>
                <StyledButton variant="text" color="gray" size="sm" onClick={searchViewAll}>
                    {t('home.discover', { ns: 'common' })} <Icon icon="ArrowRight" source="phosphor" size="sm" />
                </StyledButton>
            </ViewAllContainer>
        </Container>
    );
}
