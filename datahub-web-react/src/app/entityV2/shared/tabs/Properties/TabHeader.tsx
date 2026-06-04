import { Icon } from '@components';
import { Input } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ANTD_GRAY } from '@app/entityV2/shared/constants';

const StyledInput = styled(Input)`
    border-radius: 70px;
    max-width: 300px;
`;

const TableHeader = styled.div`
    padding: 8px 16px;
    border-bottom: 1px solid ${ANTD_GRAY[4.5]};
`;

interface Props {
    setFilterText: (text: string) => void;
}

export default function TabHeader({ setFilterText }: Props) {
    const { t } = useTranslation('common');
    return (
        <TableHeader>
            <StyledInput
                placeholder={t('entity.properties.search_placeholder')}
                onChange={(e) => setFilterText(e.target.value)}
                allowClear
                prefix={<Icon icon="MagnifyingGlass" source="phosphor" />}
            />
        </TableHeader>
    );
}
