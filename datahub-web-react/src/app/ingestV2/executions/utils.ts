import {
    EXECUTION_REQUEST_STATUS_ABORTED,
    EXECUTION_REQUEST_STATUS_ACTIVE,
    EXECUTION_REQUEST_STATUS_CANCELLED,
    EXECUTION_REQUEST_STATUS_DUPLICATE,
    EXECUTION_REQUEST_STATUS_FAILURE,
    EXECUTION_REQUEST_STATUS_LOADING,
    EXECUTION_REQUEST_STATUS_PENDING,
    EXECUTION_REQUEST_STATUS_ROLLBACK_FAILED,
    EXECUTION_REQUEST_STATUS_ROLLED_BACK,
    EXECUTION_REQUEST_STATUS_ROLLING_BACK,
    EXECUTION_REQUEST_STATUS_RUNNING,
    EXECUTION_REQUEST_STATUS_SUCCEEDED_WITH_WARNINGS,
    EXECUTION_REQUEST_STATUS_SUCCESS,
    EXECUTION_REQUEST_STATUS_UP_FOR_RETRY,
} from '@app/ingestV2/executions/constants';

import { ExecutionRequest } from '@types';

export function isExecutionRequestActive(executionRequest: ExecutionRequest) {
    return EXECUTION_REQUEST_STATUS_ACTIVE.includes(executionRequest?.result?.status ?? '');
}

export const getExecutionRequestStatusIcon = (status: string) => {
    return (
        (status === EXECUTION_REQUEST_STATUS_RUNNING && 'CircleNotch') ||
        (status === EXECUTION_REQUEST_STATUS_SUCCESS && 'Check') ||
        (status === EXECUTION_REQUEST_STATUS_SUCCEEDED_WITH_WARNINGS && 'WarningCircle') ||
        (status === EXECUTION_REQUEST_STATUS_FAILURE && 'X') ||
        (status === EXECUTION_REQUEST_STATUS_CANCELLED && 'Prohibit') ||
        (status === EXECUTION_REQUEST_STATUS_UP_FOR_RETRY && 'CircleNotch') ||
        (status === EXECUTION_REQUEST_STATUS_ROLLED_BACK && 'Warning') ||
        (status === EXECUTION_REQUEST_STATUS_ROLLING_BACK && 'CircleNotch') ||
        (status === EXECUTION_REQUEST_STATUS_ROLLBACK_FAILED && 'X') ||
        (status === EXECUTION_REQUEST_STATUS_ABORTED && 'X') ||
        (status === EXECUTION_REQUEST_STATUS_DUPLICATE && 'Copy') ||
        (status === EXECUTION_REQUEST_STATUS_PENDING && 'Clock') ||
        'CircleNotch'
    );
};

export const getExecutionRequestStatusDisplayText = (status: string, t?: (key: string) => string) => {
    if (t) {
        return (
            (status === EXECUTION_REQUEST_STATUS_RUNNING && t('ingestion.status_running')) ||
            (status === EXECUTION_REQUEST_STATUS_SUCCESS && t('ingestion.status_success')) ||
            (status === EXECUTION_REQUEST_STATUS_SUCCEEDED_WITH_WARNINGS && t('ingestion.status_success')) ||
            (status === EXECUTION_REQUEST_STATUS_FAILURE && t('ingestion.status_failed')) ||
            (status === EXECUTION_REQUEST_STATUS_CANCELLED && t('ingestion.status_cancelled')) ||
            (status === EXECUTION_REQUEST_STATUS_UP_FOR_RETRY && t('ingestion.status_up_for_retry')) ||
            (status === EXECUTION_REQUEST_STATUS_ROLLED_BACK && t('ingestion.status_rolled_back')) ||
            (status === EXECUTION_REQUEST_STATUS_ROLLING_BACK && t('ingestion.status_rolling_back')) ||
            (status === EXECUTION_REQUEST_STATUS_ROLLBACK_FAILED && t('ingestion.status_rollback_failed')) ||
            (status === EXECUTION_REQUEST_STATUS_ABORTED && t('ingestion.status_aborted')) ||
            (status === EXECUTION_REQUEST_STATUS_DUPLICATE && t('ingestion.status_duplicate')) ||
            (status === EXECUTION_REQUEST_STATUS_PENDING && t('ingestion.status_pending')) ||
            (status === EXECUTION_REQUEST_STATUS_LOADING && t('ingestion.status_loading')) ||
            status
        );
    }
    return (
        (status === EXECUTION_REQUEST_STATUS_RUNNING && 'Running') ||
        (status === EXECUTION_REQUEST_STATUS_SUCCESS && 'Success') ||
        (status === EXECUTION_REQUEST_STATUS_SUCCEEDED_WITH_WARNINGS && 'Success') ||
        (status === EXECUTION_REQUEST_STATUS_FAILURE && 'Failed') ||
        (status === EXECUTION_REQUEST_STATUS_CANCELLED && 'Cancelled') ||
        (status === EXECUTION_REQUEST_STATUS_UP_FOR_RETRY && 'Up for Retry') ||
        (status === EXECUTION_REQUEST_STATUS_ROLLED_BACK && 'Rolled Back') ||
        (status === EXECUTION_REQUEST_STATUS_ROLLING_BACK && 'Rolling Back') ||
        (status === EXECUTION_REQUEST_STATUS_ROLLBACK_FAILED && 'Rollback Failed') ||
        (status === EXECUTION_REQUEST_STATUS_ABORTED && 'Aborted') ||
        (status === EXECUTION_REQUEST_STATUS_DUPLICATE && 'Duplicate') ||
        (status === EXECUTION_REQUEST_STATUS_PENDING && 'Pending') ||
        (status === EXECUTION_REQUEST_STATUS_LOADING && 'Loading') ||
        status
    );
};

export const getExecutionRequestStatusDisplayColor = (status: string) => {
    return (
        (status === EXECUTION_REQUEST_STATUS_RUNNING && 'blue') ||
        (status === EXECUTION_REQUEST_STATUS_SUCCESS && 'green') ||
        (status === EXECUTION_REQUEST_STATUS_SUCCEEDED_WITH_WARNINGS && 'yellow') ||
        (status === EXECUTION_REQUEST_STATUS_FAILURE && 'red') ||
        (status === EXECUTION_REQUEST_STATUS_UP_FOR_RETRY && 'yellow') ||
        (status === EXECUTION_REQUEST_STATUS_CANCELLED && 'gray') ||
        (status === EXECUTION_REQUEST_STATUS_ROLLED_BACK && 'yellow') ||
        (status === EXECUTION_REQUEST_STATUS_ROLLING_BACK && 'yellow') ||
        (status === EXECUTION_REQUEST_STATUS_ROLLBACK_FAILED && 'red') ||
        (status === EXECUTION_REQUEST_STATUS_ABORTED && 'gray') ||
        (status === EXECUTION_REQUEST_STATUS_DUPLICATE && 'gray') ||
        (status === EXECUTION_REQUEST_STATUS_PENDING && 'gray') ||
        'gray'
    );
};

export const getExecutionRequestSummaryText = (status: string, t?: (key: string) => string) => {
    if (t) {
        switch (status) {
            case EXECUTION_REQUEST_STATUS_RUNNING:
                return t('ingestion.summary_running');
            case EXECUTION_REQUEST_STATUS_SUCCESS:
                return t('ingestion.summary_success');
            case EXECUTION_REQUEST_STATUS_SUCCEEDED_WITH_WARNINGS:
                return t('ingestion.summary_warnings');
            case EXECUTION_REQUEST_STATUS_FAILURE:
                return t('ingestion.summary_failed');
            case EXECUTION_REQUEST_STATUS_CANCELLED:
                return t('ingestion.summary_cancelled');
            case EXECUTION_REQUEST_STATUS_ROLLED_BACK:
                return t('ingestion.summary_rolled_back');
            case EXECUTION_REQUEST_STATUS_ROLLING_BACK:
                return t('ingestion.summary_rolling_back');
            case EXECUTION_REQUEST_STATUS_ROLLBACK_FAILED:
                return t('ingestion.summary_rollback_failed');
            case EXECUTION_REQUEST_STATUS_ABORTED:
                return t('ingestion.summary_aborted');
            default:
                return t('ingestion.summary_unknown');
        }
    }
    switch (status) {
        case EXECUTION_REQUEST_STATUS_RUNNING:
            return 'Ingestion is running...';
        case EXECUTION_REQUEST_STATUS_SUCCESS:
            return 'Ingestion completed with no errors or warnings.';
        case EXECUTION_REQUEST_STATUS_SUCCEEDED_WITH_WARNINGS:
            return 'Ingestion completed with some warnings.';
        case EXECUTION_REQUEST_STATUS_FAILURE:
            return 'Ingestion failed to complete, or completed with errors.';
        case EXECUTION_REQUEST_STATUS_CANCELLED:
            return 'Ingestion was cancelled.';
        case EXECUTION_REQUEST_STATUS_ROLLED_BACK:
            return 'Ingestion was rolled back.';
        case EXECUTION_REQUEST_STATUS_ROLLING_BACK:
            return 'Ingestion is in the process of rolling back.';
        case EXECUTION_REQUEST_STATUS_ROLLBACK_FAILED:
            return 'Ingestion rollback failed.';
        case EXECUTION_REQUEST_STATUS_ABORTED:
            return 'Ingestion job got aborted due to worker restart.';
        default:
            return 'Ingestion status not recognized.';
    }
};
