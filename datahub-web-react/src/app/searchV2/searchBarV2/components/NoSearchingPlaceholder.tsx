import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Text } from '@src/alchemy-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
`;

export default function NoSearchingPlaceholder() {
    const { t } = useTranslation('common');
    return (
        <Container>
            <Text color="gray" colorLevel={600} size="md">
                {t('search.start_searching')}
            </Text>
            <Text color="gray" size="sm">
                {t('search.start_searching_desc')}
            </Text>
        </Container>
    );
}
