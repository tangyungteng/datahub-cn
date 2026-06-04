import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import UserWithAvatar from '@app/ingestV2/shared/components/UserWithAvatar';
import { CLI_INGESTION_SOURCE, MANUAL_INGESTION_SOURCE, SCHEDULED_INGESTION_SOURCE } from '@app/ingestV2/source/utils';

import { CorpUser } from '@types';

const UserContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    wrap: auto;
`;

interface SourceColumnProps {
    source?: string | null;
    actor?: CorpUser | null;
}

export function ExecutedByColumn({ source, actor }: SourceColumnProps) {
    const { t } = useTranslation('common');
    switch (source) {
        case MANUAL_INGESTION_SOURCE:
            if (!actor) return <>{t('ingestion.manual_execution')}</>;
            return (
                <UserContainer>
                    {t('ingestion.manual_execution_by')} <UserWithAvatar user={actor} />
                </UserContainer>
            );

        case SCHEDULED_INGESTION_SOURCE:
            return <span>{t('ingestion.scheduled_execution')}</span>;

        case CLI_INGESTION_SOURCE:
            return <span>{t('ingestion.cli_execution')}</span>;

        default:
            return <span>-</span>;
    }
}
