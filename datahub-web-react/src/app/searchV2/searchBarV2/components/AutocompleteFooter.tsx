import { ArrowDown, ArrowElbowDownLeft, ArrowUp } from 'phosphor-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import KeyIcon from '@app/searchV2/searchBarV2/components/KeyIcon';
import { Text, colors } from '@src/alchemy-components';

const Container = styled.div`
    position: sticky;
    bottom: 0;

    border-top: 1px solid ${colors.gray[100]};
    border-radius: 0 0 12px 12px;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;

    background-color: ${colors.white};
    height: 36px;
    width: 100%;

    padding: 8px 16px;
`;

const KeySuggestion = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
`;

interface Props {
    isSomethingSelected?: boolean;
}

export default function AutocompleteFooter({ isSomethingSelected }: Props) {
    const { t } = useTranslation('common');
    return (
        <Container>
            <KeySuggestion>
                <KeyIcon icon={ArrowUp} />
                <KeyIcon icon={ArrowDown} />
                <Text color="gray" size="sm" weight="semiBold">
                    {t('search.navigate')}
                </Text>
            </KeySuggestion>

            <KeySuggestion>
                <KeyIcon icon={ArrowElbowDownLeft} />
                <Text color="gray" size="sm" weight="semiBold">
                    {isSomethingSelected ? t('search.select') : t('search.search_all')}
                </Text>
            </KeySuggestion>
        </Container>
    );
}
