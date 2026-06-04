import { DownloadOutlined } from '@ant-design/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { DetailsContainer } from '@app/ingestV2/executions/components/BaseTab';
import { downloadFile } from '@app/search/utils/csvUtils';
import { Button, Heading, Text, Tooltip } from '@src/alchemy-components';

import { GetIngestionExecutionRequestQuery } from '@graphql/ingestion.generated';

const SectionSubHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SubHeaderParagraph = styled(Text)`
    margin-bottom: 0px;
`;

const LogsSection = styled.div`
    padding: 16px 20px 16px 0;
`;

export const LogsTab = ({ urn, data }: { urn: string; data: GetIngestionExecutionRequestQuery | undefined }) => {
    const { t } = useTranslation('common');
    const output = data?.executionRequest?.result?.report || 'No output found.';

    const downloadLogs = () => {
        downloadFile(output, `exec-${urn}.log`);
    };

    return (
        <LogsSection>
            <Heading type="h4" size="lg" weight="bold">
                {t('ingestion.logs')}
            </Heading>
            <SectionSubHeader>
                <SubHeaderParagraph color="gray" colorLevel={600}>
                    {t('ingestion.logs_desc')}
                </SubHeaderParagraph>
                <Tooltip title={t('ingestion.download_logs')}>
                    <Button variant="text" onClick={downloadLogs}>
                        <DownloadOutlined />
                    </Button>
                </Tooltip>
            </SectionSubHeader>
            <DetailsContainer>
                <Text size="sm">
                    <pre>{output}</pre>
                </Text>
            </DetailsContainer>
        </LogsSection>
    );
};
