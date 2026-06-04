import { PlusOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { useRouteToTab } from '@app/entity/shared/EntityContext';
import { EMPTY_MESSAGES } from '@app/entityV2/shared/constants';

const EmptyContentWrapper = styled.div`
    font-size: 12px;
    display: flex;
    justify-content: start;
    align-items: start;
`;

const EmptyContentMessage = styled(Typography.Text)`
    font-size: 12px;
`;

const AddButton = styled.div`
    margin: 0px;
    padding: 0px;
    margin-left: 12px;
    :hover {
        cursor: pointer;
    }
`;

interface Props {
    readOnly?: boolean;
}

export default function EmptyContentSection({ readOnly }: Props) {
    const { t } = useTranslation();
    const routeToTab = useRouteToTab();

    return (
        <EmptyContentWrapper>
            <EmptyContentMessage type="secondary">{t(EMPTY_MESSAGES.documentation.title)}</EmptyContentMessage>
            {!readOnly && (
                <AddButton onClick={() => routeToTab({ tabName: 'Documentation', tabParams: { editing: true } })}>
                    <PlusOutlined style={{ fontSize: 10, marginRight: 6 }} /> {t('entity.section.add_docs')}
                </AddButton>
            )}
        </EmptyContentWrapper>
    );
}
