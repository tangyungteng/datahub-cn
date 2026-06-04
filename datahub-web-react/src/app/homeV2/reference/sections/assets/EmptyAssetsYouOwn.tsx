import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ANTD_GRAY } from '@app/entity/shared/constants';

const Text = styled.div`
    font-size: 14px;
    color: ${ANTD_GRAY[7]};
`;

export const EmptyAssetsYouOwn = () => {
    const { t } = useTranslation('common');
    return (
        <Text>
            {t('home.no_owned_assets')}
            <br />
            <a target="_blank" rel="noreferrer noopener" href="https://docs.datahub.com/docs/ownership/ownership-types">
                {t('home.learn_more')}
            </a>{' '}
            {t('home.about_ownership')}
        </Text>
    );
};
