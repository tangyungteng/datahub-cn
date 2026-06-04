import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import DomainIcon from '@app/domain/DomainIcon';

const IconWrapper = styled.span`
    margin-right: 10px;
`;

export default function DomainsTitle() {
    const { t } = useTranslation('common');
    return (
        <span>
            <IconWrapper>
                <DomainIcon />
            </IconWrapper>
            {t('domains.title')}
        </span>
    );
}
