import React, { useState, useRef, useEffect } from 'react';
import {
  Modal, Form, Button, FloatingLabel, Alert, Row, Col,
} from 'react-bootstrap';
import { GrUndo } from 'react-icons/gr';
import { useTranslation } from 'react-i18next';
import { uniqBy, without } from 'lodash';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { useUpdateProductMutation, useUpdateProductBatchMutation } from '../services/api.js';
import CategoryTree from './CategoryTree.jsx';

const modalInfoMapping = {
  singleEditing: {
    title: 'titles.productEditing',
    submit: 'elements.change',
    formFields: ['name'],
    autoFocusMethod: 'select',
  },
  batchEditing: {
    title: 'titles.batchProductsEditing',
    submit: 'elements.change',
    formFields: [],
    autoFocusMethod: 'select',
  },
};

const ProductModal = ({
  selectedItems = [{ name: '', categoryId: null }], variant, onHide, products, categories,
}) => {
  const isCategorySingle = uniqBy(selectedItems, 'categoryId').length === 1;
  const [{
    productId: selectedItemId,
    name: selectedItemName,
    categoryId: initialCategoryId,
  }] = selectedItems;

  const [selectedItemCategoryId, setSelectedItemCategoryId] = useState(isCategorySingle
    ? initialCategoryId : null);
  const [alert, setAlert] = useState({ show: false, message: '' });
  const [updateProduct] = useUpdateProductMutation();
  const [updateProductBatch] = useUpdateProductBatchMutation();
  const autoFocusRef = useRef();
  const treeRef = useRef();
  const { t } = useTranslation();

  const modalInfo = modalInfoMapping[variant];

  useEffect(() => {
    autoFocusRef.current?.[modalInfo.autoFocusMethod]();
  }, [modalInfo.autoFocusMethod]);

  const submitActionMapping = {
    singleEditing: (name) => updateProduct({
      id: selectedItemId,
      name,
      categoryId: selectedItemCategoryId,
    }),
    batchEditing: () => updateProductBatch({
      ids: selectedItems.map(({ productId }) => productId),
      categoryId: selectedItemCategoryId,
    }),
  };
  const onCloseAlert = () => setAlert({ ...alert, show: false });

  const validationSchema = yup.object().shape({
    name: yup.string().trim().required()
      .min(3)
      .notOneOf(without(products.map(({ name }) => name), selectedItemName)),
  });
  const formik = useFormik({
    initialValues: {
      name: variant === 'singleEditing' ? selectedItemName : '',
    },
    initialErrors: variant === 'singleEditing' ? { name: null } : {},
    onSubmit: async ({ name }, { setSubmitting }) => {
      onCloseAlert();
      try {
        await submitActionMapping[variant](name);
        onHide();
      } catch (err) {
        console.log(err);
        autoFocusRef.current.select();
        setAlert({
          show: true,
          message: t('errors.mutation', { resource: t('elements.products') }),
        });
        setSubmitting(false);
      }
    },
    validationSchema: validationSchema.pick(modalInfo.formFields),
  });

  return (
    <Modal show onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{t(modalInfo.title)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert
          show={alert.show}
          variant="danger"
          dismissible
          onClose={onCloseAlert}
        >
          {alert.message}
        </Alert>
        <div className="p-3 border rounded-3 border-secondary mb-3">
          <Row className="mb-2">
            <Col>
              <FloatingLabel
                controlId="productCategoryId"
                label={t('labels.category')}
              >
                <Form.Control
                  type="text"
                  placeholder="categoryId"
                  value={categories[selectedItemCategoryId]?.name || t('elements.notSelected')}
                  readOnly
                />
              </FloatingLabel>
            </Col>
            <Col xs="auto">
              <Button
                variant="outline-light"
                className="h-100 px-3"
                onClick={() => {
                  setSelectedItemCategoryId(null);
                  treeRef.current.selectItems([]);
                }}
              >
                <GrUndo size="1.5em" />
              </Button>
            </Col>
          </Row>
          <CategoryTree
            onSelect={(id) => setSelectedItemCategoryId(id)}
            selectedItem={selectedItemCategoryId}
            treeRef={treeRef}
          />
        </div>
        <Form id="productForm" onSubmit={formik.handleSubmit}>
          {modalInfo.formFields.includes('name') && (
            <FloatingLabel
              controlId="productName"
              label={t('labels.name')}
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="productName"
                name="name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                isInvalid={formik.touched.name && !!formik.errors.name}
                ref={autoFocusRef}
              />
              <Form.Control.Feedback type="invalid" tooltip className="end-0">
                {t(formik.errors.name?.key, formik.errors.name?.values)}
              </Form.Control.Feedback>
            </FloatingLabel>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('elements.close')}
        </Button>
        <Button
          type="submit"
          form="productForm"
          variant="outline-info"
          disabled={!formik.isValid || formik.isSubmitting}
        >
          {t(modalInfo.submit)}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
