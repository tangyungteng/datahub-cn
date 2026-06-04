import { CloseOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ANTD_GRAY } from '@app/entity/shared/constants';
import { SourceConfig } from '@app/ingestV2/source/builder/types';

const Container = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    padding: 12px 12px 16px 24px;
    border: 1px solid #e0e0e0;
    margin-bottom: 20px;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
`;

const Title = styled.div`
    font-size: 16px;
    font-weight: bold;
`;

const Description = styled.div`
    font-size: 14px;
    max-width: 90%;
`;

const StyledCloseOutlined = styled(CloseOutlined)`
    color: ${ANTD_GRAY[6]};
`;

interface Props {
    sourceConfigs: SourceConfig;
    onHide: () => void;
}

export const IngestionDocumentationHint = ({ sourceConfigs, onHide }: Props) => {
    const { t } = useTranslation('common');
    const { displayName, docsUrl } = sourceConfigs;
    return (
        <Container>
            <Header>
                <Title>{t('ingestion.lets_connect')} 🎉</Title>
                <Tooltip showArrow={false} title={t('ingestion.hide')}>
                    <Button type="text" icon={<StyledCloseOutlined />} onClick={onHide} />
                </Tooltip>
            </Header>
            <Description>
                <div style={{ marginBottom: 8 }}>{t('ingestion.docs_hint_intro', { name: displayName })}</div>
                <div>
                    {t('ingestion.docs_hint_check_prefix')}{' '}
                    <a href={docsUrl} target="_blank" rel="noopener noreferrer">
                        {t('ingestion.docs_hint_guide_link', { name: displayName })}
                    </a>
                    {t('ingestion.docs_hint_check_suffix')}
                </div>
            </Description>
        </Container>
    );
};
