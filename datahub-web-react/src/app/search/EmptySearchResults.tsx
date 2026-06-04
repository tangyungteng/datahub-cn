import { RocketOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import styled from 'styled-components';

import analytics, { EventType } from '@app/analytics';
import { useUserContext } from '@app/context/useUserContext';
import { ANTD_GRAY_V2 } from '@app/entity/shared/constants';
import { SuggestedText } from '@app/search/suggestions/SearchQuerySugggester';
import useGetSearchQueryInputs from '@app/search/useGetSearchQueryInputs';
import { navigateToSearchUrl } from '@app/search/utils/navigateToSearchUrl';

import { SearchSuggestion } from '@types';

const NoDataContainer = styled.div`
    margin: 40px auto;
    font-size: 16px;
    color: ${ANTD_GRAY_V2[8]};
`;

const Section = styled.div`
    margin-bottom: 16px;
`;

interface Props {
    suggestions: SearchSuggestion[];
}

export default function EmptySearchResults({ suggestions }: Props) {
    const { t } = useTranslation('search');
    const { query, filters, viewUrn } = useGetSearchQueryInputs();
    const history = useHistory();
    const userContext = useUserContext();
    const suggestText = suggestions.length > 0 ? suggestions[0].text : '';
    const getRefineSearchText = () => {
        if (filters.length && viewUrn) {
            return t('empty.clearing_all_filters_and_view');
        }
        if (filters.length) {
            return t('empty.clearing_all_filters');
        }
        if (viewUrn) {
            return t('empty.clearing_selected_view');
        }
        return '';
    };
    const refineSearchText = getRefineSearchText();

    const onClickExploreAll = useCallback(() => {
        analytics.event({ type: EventType.SearchResultsExploreAllClickEvent });
        navigateToSearchUrl({ query: '*', history });
    }, [history]);

    const searchForSuggestion = () => {
        navigateToSearchUrl({ query: suggestText, history });
    };

    const clearFiltersAndView = () => {
        navigateToSearchUrl({ query, history });
        userContext.updateLocalState({
            ...userContext.localState,
            selectedViewUrn: undefined,
        });
    };

    return (
        <NoDataContainer>
            <Section>{t('empty.no_results_query', { query })}</Section>
            {refineSearchText && (
                <>
                    {t('empty.try')} <SuggestedText onClick={clearFiltersAndView}>{refineSearchText}</SuggestedText>{' '}
                    {suggestText && (
                        <>
                            {t('empty.or_searching_for')}{' '}
                            <SuggestedText onClick={searchForSuggestion}>{suggestText}</SuggestedText>
                        </>
                    )}
                </>
            )}
            {!refineSearchText && suggestText && (
                <>
                    {t('empty.did_you_mean')}{' '}
                    <SuggestedText onClick={searchForSuggestion}>{suggestText}</SuggestedText>
                </>
            )}
            {!refineSearchText && !suggestText && (
                <Button onClick={onClickExploreAll}>
                    <RocketOutlined /> {t('empty.explore_all')}
                </Button>
            )}
        </NoDataContainer>
    );
}
