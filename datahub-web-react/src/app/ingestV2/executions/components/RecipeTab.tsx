import { DownloadOutlined } from '@ant-design/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import YAML from 'yamljs';

import { DetailsContainer, SectionBase } from '@app/ingestV2/executions/components/BaseTab';
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

const RecipeSection = styled(SectionBase)``;

export const RecipeTab = ({ urn, data }: { urn: string; data: GetIngestionExecutionRequestQuery | undefined }) => {
    const { t } = useTranslation('common');
    const recipeJson = data?.executionRequest?.input?.arguments?.find((arg) => arg.key === 'recipe')?.value;
    let recipeYaml: string;
    try {
        recipeYaml = recipeJson && YAML.stringify(JSON.parse(recipeJson), 8, 2).trim();
    } catch (e) {
        recipeYaml = '';
    }

    const downloadRecipe = () => {
        downloadFile(recipeYaml, `recipe-${urn}.yaml`);
    };

    return (
        <RecipeSection>
            <Heading type="h4" size="lg" weight="bold">
                {t('ingestion.recipe')}
            </Heading>
            <SectionSubHeader>
                <SubHeaderParagraph color="gray" colorLevel={600}>
                    {t('ingestion.recipe_desc')}
                </SubHeaderParagraph>
                <Tooltip title={t('ingestion.download_recipe')}>
                    <Button variant="text" onClick={downloadRecipe}>
                        <DownloadOutlined />
                    </Button>
                </Tooltip>
            </SectionSubHeader>
            <DetailsContainer>
                <Text size="sm">
                    <pre>{recipeYaml || 'No recipe found.'}</pre>
                </Text>
            </DetailsContainer>
        </RecipeSection>
    );
};
