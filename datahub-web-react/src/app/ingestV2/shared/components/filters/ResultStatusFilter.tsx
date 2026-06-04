import { SimpleSelect } from '@components';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    EXECUTION_REQUEST_STATUS_ABORTED,
    EXECUTION_REQUEST_STATUS_CANCELLED,
    EXECUTION_REQUEST_STATUS_DUPLICATE,
    EXECUTION_REQUEST_STATUS_FAILURE,
    EXECUTION_REQUEST_STATUS_ROLLBACK_FAILED,
    EXECUTION_REQUEST_STATUS_ROLLED_BACK,
    EXECUTION_REQUEST_STATUS_ROLLING_BACK,
    EXECUTION_REQUEST_STATUS_RUNNING,
    EXECUTION_REQUEST_STATUS_SUCCESS,
} from '@app/ingestV2/executions/constants';

export const RESULT_STATUS_ALL_VALUE = 'All Statuses';

interface Props {
    defaultValues?: string[];
    onUpdate?: (selectedValues: string[]) => void;
}

export default function ResultStatusFilter({ defaultValues, onUpdate }: Props) {
    const { t } = useTranslation('common');
    const [values, setValues] = useState<string[]>(defaultValues || [RESULT_STATUS_ALL_VALUE]);

    const onUpdateHandler = useCallback(
        (selectedValues: string[]) => {
            setValues(selectedValues);
            onUpdate?.(selectedValues);
        },
        [onUpdate],
    );

    return (
        <SimpleSelect
            options={[
                { label: t('ingestion.status_all'), value: RESULT_STATUS_ALL_VALUE },
                { label: t('ingestion.status_success'), value: EXECUTION_REQUEST_STATUS_SUCCESS },
                { label: t('ingestion.status_failed'), value: EXECUTION_REQUEST_STATUS_FAILURE },
                { label: t('ingestion.status_running'), value: EXECUTION_REQUEST_STATUS_RUNNING },
                { label: t('ingestion.status_cancelled'), value: EXECUTION_REQUEST_STATUS_CANCELLED },
                { label: t('ingestion.status_aborted'), value: EXECUTION_REQUEST_STATUS_ABORTED },
                { label: t('ingestion.status_rolled_back'), value: EXECUTION_REQUEST_STATUS_ROLLED_BACK },
                { label: t('ingestion.status_rolling_back'), value: EXECUTION_REQUEST_STATUS_ROLLING_BACK },
                { label: t('ingestion.status_rollback_failed'), value: EXECUTION_REQUEST_STATUS_ROLLBACK_FAILED },
                { label: t('ingestion.status_duplicate'), value: EXECUTION_REQUEST_STATUS_DUPLICATE },
            ]}
            values={values}
            onUpdate={onUpdateHandler}
            showClear={false}
            width="fit-content"
            placeholder={t('ingestion.result_status')}
        />
    );
}
