import { Button, Collapse, Form, Input, Modal, Tag, Typography, message } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import analytics, { EventType } from '@app/analytics';
import { useDomainsContext } from '@app/domain/DomainsContext';
import DomainParentSelect from '@app/entity/shared/EntityDropdown/DomainParentSelect';
import { validateCustomUrnId } from '@app/shared/textUtil';
import { useEnterKeyListener } from '@app/shared/useEnterKeyListener';
import { useIsNestedDomainsEnabled } from '@app/useAppConfig';

import { useCreateDomainMutation } from '@graphql/domain.generated';

const SuggestedNamesGroup = styled.div`
    margin-top: 8px;
`;

const ClickableTag = styled(Tag)`
    :hover {
        cursor: pointer;
    }
`;

const FormItem = styled(Form.Item)`
    .ant-form-item-label {
        padding-bottom: 2px;
    }
`;

const FormItemWithMargin = styled(FormItem)`
    margin-bottom: 16px;
`;

const FormItemNoMargin = styled(FormItem)`
    margin-bottom: 0;
`;

const FormItemLabel = styled(Typography.Text)`
    font-weight: 600;
    color: #373d44;
`;

const AdvancedLabel = styled(Typography.Text)`
    color: #373d44;
`;

type Props = {
    onClose: () => void;
    onCreate: (
        urn: string,
        id: string | undefined,
        name: string,
        description: string | undefined,
        parentDomain?: string,
    ) => void;
};

const SUGGESTED_DOMAIN_NAMES = ['Engineering', 'Marketing', 'Sales', 'Product'];

const ID_FIELD_NAME = 'id';
const NAME_FIELD_NAME = 'name';
const DESCRIPTION_FIELD_NAME = 'description';

export default function CreateDomainModal({ onClose, onCreate }: Props) {
    const { t } = useTranslation('common');
    const isNestedDomainsEnabled = useIsNestedDomainsEnabled();
    const [createDomainMutation] = useCreateDomainMutation();
    const { entityData } = useDomainsContext();
    const [selectedParentUrn, setSelectedParentUrn] = useState<string>(
        (isNestedDomainsEnabled && entityData?.urn) || '',
    );
    const [createButtonEnabled, setCreateButtonEnabled] = useState(false);
    const [form] = Form.useForm();

    const onCreateDomain = () => {
        createDomainMutation({
            variables: {
                input: {
                    id: form.getFieldValue(ID_FIELD_NAME),
                    name: form.getFieldValue(NAME_FIELD_NAME),
                    description: form.getFieldValue(DESCRIPTION_FIELD_NAME),
                    parentDomain: selectedParentUrn || undefined,
                },
            },
        })
            .then(({ data, errors }) => {
                if (!errors) {
                    analytics.event({
                        type: EventType.CreateDomainEvent,
                        parentDomainUrn: selectedParentUrn || undefined,
                    });
                    message.success({
                        content: t('domains.created_success'),
                        duration: 3,
                    });
                    onCreate(
                        data?.createDomain || '',
                        form.getFieldValue(ID_FIELD_NAME),
                        form.getFieldValue(NAME_FIELD_NAME),
                        form.getFieldValue(DESCRIPTION_FIELD_NAME),
                        selectedParentUrn || undefined,
                    );
                    form.resetFields();
                }
            })
            .catch((e) => {
                message.destroy();
                message.error({ content: `${t('domains.create_failed')}${e.message || ''}`, duration: 3 });
            })
            .finally(() => {
                onClose();
            });
    };

    // Handle the Enter press
    useEnterKeyListener({
        querySelectorToExecuteClick: '#createDomainButton',
    });

    return (
        <Modal
            title={t('domains.create_modal_title')}
            open
            onCancel={onClose}
            footer={
                <>
                    <Button onClick={onClose} type="text">
                        {t('action.cancel')}
                    </Button>
                    <Button
                        id="createDomainButton"
                        data-testid="create-domain-button"
                        onClick={onCreateDomain}
                        disabled={!createButtonEnabled}
                    >
                        {t('action.create')}
                    </Button>
                </>
            }
        >
            <Form
                form={form}
                initialValues={{}}
                layout="vertical"
                onFieldsChange={() => {
                    setCreateButtonEnabled(!form.getFieldsError().some((field) => field.errors.length > 0));
                }}
            >
                {isNestedDomainsEnabled && (
                    <FormItemWithMargin label={<FormItemLabel>{t('domains.parent_label')}</FormItemLabel>}>
                        <DomainParentSelect
                            selectedParentUrn={selectedParentUrn}
                            setSelectedParentUrn={setSelectedParentUrn}
                        />
                    </FormItemWithMargin>
                )}
                <FormItemWithMargin label={<FormItemLabel>{t('domains.name_label')}</FormItemLabel>}>
                    <FormItemNoMargin
                        name={NAME_FIELD_NAME}
                        rules={[
                            {
                                required: true,
                                message: t('domains.name_required'),
                            },
                            { whitespace: true },
                            { min: 1, max: 150 },
                        ]}
                        hasFeedback
                    >
                        <Input data-testid="create-domain-name" placeholder={t('domains.name_placeholder')} />
                    </FormItemNoMargin>
                    <SuggestedNamesGroup>
                        {SUGGESTED_DOMAIN_NAMES.map((name) => {
                            return (
                                <ClickableTag
                                    key={name}
                                    onClick={() => {
                                        form.setFieldsValue({
                                            name,
                                        });
                                        setCreateButtonEnabled(true);
                                    }}
                                >
                                    {name}
                                </ClickableTag>
                            );
                        })}
                    </SuggestedNamesGroup>
                </FormItemWithMargin>
                <FormItemWithMargin
                    label={<FormItemLabel>{t('domains.desc_label')}</FormItemLabel>}
                    help={t('domains.desc_help')}
                >
                    <FormItemNoMargin
                        name={DESCRIPTION_FIELD_NAME}
                        rules={[{ whitespace: true }, { min: 1, max: 500 }]}
                        hasFeedback
                    >
                        <Input.TextArea
                            placeholder={t('domains.desc_placeholder')}
                            data-testid="create-domain-description"
                        />
                    </FormItemNoMargin>
                </FormItemWithMargin>
                <Collapse ghost>
                    <Collapse.Panel header={<AdvancedLabel>{t('domains.advanced_options')}</AdvancedLabel>} key="1">
                        <FormItemWithMargin
                            label={<Typography.Text strong>{t('domains.domain_id_label')}</Typography.Text>}
                            help={t('domains.domain_id_help')}
                        >
                            <FormItemNoMargin
                                name={ID_FIELD_NAME}
                                rules={[
                                    () => ({
                                        validator(_, value) {
                                            if (value && validateCustomUrnId(value)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error(t('domains.domain_id_invalid')));
                                        },
                                    }),
                                ]}
                            >
                                <Input data-testid="create-domain-id" placeholder="engineering" />
                            </FormItemNoMargin>
                        </FormItemWithMargin>
                    </Collapse.Panel>
                </Collapse>
            </Form>
        </Modal>
    );
}
