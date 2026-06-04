import type { ItemType } from 'antd/lib/menu/hooks/useItems';
import moment from 'moment';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { ANTD_GRAY } from '@app/entity/shared/constants';
import OptionsDropdownMenu from '@app/searchV2/filters/OptionsDropdownMenu';
import { FilterValue, TimeBucketFilterField } from '@app/searchV2/filters/types';
import { OptionMenu } from '@app/searchV2/filters/value/styledComponents';

const FilterOptionWrapper = styled.div`
    display: flex;
    align-items: center;

    margin: 0 4px;
    padding: 10px;

    border-radius: 8px;

    font-size: 14px;

    &:hover {
        background-color: ${ANTD_GRAY[3]};
    }
`;

interface Props {
    field: TimeBucketFilterField;
    values: FilterValue[];
    onChangeValues: (newValues: FilterValue[]) => void;
    onApply: () => void;
    type?: 'card' | 'default';
    className?: string;
}

// Maps the static English option labels from fields.tsx to i18n keys for translation at render time.
const TIME_LABEL_TO_KEY: Record<string, string> = {
    'Last 1 day': 'search.last_1_day',
    'Last 3 days': 'search.last_3_days',
    'Last week': 'search.last_week',
    'Last two weeks': 'search.last_two_weeks',
    'Last month': 'search.last_month',
    'Last 3 months': 'search.last_3_months',
    'Last 6 months': 'search.last_6_months',
    'Last year': 'search.last_year',
};

export default function TimeBucketMenu({ field, values, type = 'card', onChangeValues, onApply, className }: Props) {
    const { t } = useTranslation('common');
    const filterMenuOptions = useMemo(
        () =>
            field.options.map(({ label, startOffsetMillis }): ItemType => {
                const timestamp = moment()
                    .subtract(startOffsetMillis, 'milliseconds')
                    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                    .valueOf()
                    .toString();
                const translatedLabel = TIME_LABEL_TO_KEY[label] ? t(TIME_LABEL_TO_KEY[label]) : label;
                return {
                    key: timestamp,
                    label: <FilterOptionWrapper>{translatedLabel}</FilterOptionWrapper>,
                    onClick: () => onChangeValues([{ value: timestamp, entity: null }]),
                };
            }),
        [field.options, onChangeValues, t],
    );

    const selectedKey = useMemo(
        () => filterMenuOptions.find((option) => values.length && option?.key === values[0].value)?.key,
        [filterMenuOptions, values],
    );

    return (
        <OptionsDropdownMenu
            menu={
                <OptionMenu
                    items={filterMenuOptions}
                    selectedKeys={selectedKey ? [selectedKey.toString()] : undefined}
                />
            }
            updateFilters={onApply}
            showSearchBar={false}
            type={type}
            className={className}
        />
    );
}
