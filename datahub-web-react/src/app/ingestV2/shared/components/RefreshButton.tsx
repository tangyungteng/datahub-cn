import { Button } from '@components';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    id?: string;
    onClick?: () => void;
}

export default function RefreshButton({ id, onClick }: Props) {
    const { t } = useTranslation('common');
    return (
        <Button id={id} variant="text" onClick={onClick} icon={{ icon: 'ArrowClockwise', source: 'phosphor' }}>
            {t('common.refresh')}
        </Button>
    );
}
