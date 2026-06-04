import { Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components/macro';

import { ANTD_GRAY } from '@app/entity/shared/constants';

const StyledParagraph = styled(Typography.Paragraph)`
    text-align: justify;
    text-justify: inter-word;
    margin: 40px 0;
    font-size: 15px;
`;

function EmptyDomainDescription() {
    const { t } = useTranslation('common');
    return (
        <>
            <StyledParagraph type="secondary">
                <strong style={{ color: ANTD_GRAY[8] }}>{t('domains.welcome_strong')}</strong>
                {t('domains.welcome_rest')}
            </StyledParagraph>
            <StyledParagraph type="secondary">
                <strong style={{ color: ANTD_GRAY[8] }}>{t('domains.nested_strong')}</strong>
                {t('domains.nested_rest')}
            </StyledParagraph>
            <StyledParagraph type="secondary">
                <strong style={{ color: ANTD_GRAY[8] }}>{t('domains.products_strong')}</strong>
                {t('domains.products_rest')}
            </StyledParagraph>
            <StyledParagraph type="secondary">{t('domains.ready')}</StyledParagraph>
        </>
    );
}

export default EmptyDomainDescription;
