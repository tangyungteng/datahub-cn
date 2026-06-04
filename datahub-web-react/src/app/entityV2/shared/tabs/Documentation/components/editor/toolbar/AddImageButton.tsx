import { PictureOutlined } from '@ant-design/icons';
import { Modal } from '@components';
import { useCommands } from '@remirror/react';
import { Form, Input, Typography } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CommandButton } from '@app/entity/shared/tabs/Documentation/components/editor/toolbar/CommandButton';

export const AddImageButton = () => {
    const { t } = useTranslation('common');
    const [isModalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const { insertImage } = useCommands();

    const handleButtonClick = () => {
        setModalVisible(true);
    };

    const handleOk = () => {
        form.validateFields()
            .then((values) => {
                form.resetFields();
                setModalVisible(false);
                insertImage(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleCancel = () => {
        setModalVisible(false);
    };

    return (
        <>
            <CommandButton
                active={false}
                icon={<PictureOutlined />}
                commandName="insertImage"
                onClick={handleButtonClick}
            />
            <Modal
                title={t('entity.documentation.add_image')}
                open={isModalVisible}
                okText={t('action.save')}
                buttons={[
                    {
                        text: t('action.add'),
                        variant: 'filled',
                        onClick: handleOk,
                    },
                ]}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical" colon={false} requiredMark={false}>
                    <Form.Item
                        name="src"
                        label={<Typography.Text strong>{t('entity.documentation.image_url')}</Typography.Text>}
                        rules={[{ required: true }]}
                    >
                        <Input placeholder="http://www.example.com/image.jpg" autoFocus />
                    </Form.Item>
                    <Form.Item name="alt" label={<Typography.Text strong>{t('entity.documentation.alt_text')}</Typography.Text>}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};
