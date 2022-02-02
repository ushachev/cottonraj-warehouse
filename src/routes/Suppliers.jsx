import React, { useState, useEffect, useRef } from 'react';
import {
  Row, Col, Button, Collapse, Form, FloatingLabel, ToastContainer, Toast,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { useGetSuppliersQuery, useAddSupplierMutation } from '../services/api.js';
import SupplierList from '../components/SupplierList.jsx';

const Suppliers = () => {
  const { data: suppliers, error: queryError, isLoading } = useGetSuppliersQuery();
  const [createSupplier] = useAddSupplierMutation();
  const [toastMessage, setToastMessage] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const supplierNameRef = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    if (queryError) {
      setToastMessage('errors.loading');
    }

    return () => setToastMessage(null);
  }, [queryError]);

  const formik = useFormik({
    initialValues: { name: '', shortName: '' },
    initialErrors: { name: null },
    onSubmit: async ({ name, shortName }, { resetForm }) => {
      setToastMessage(null);
      try {
        await createSupplier({ name, shortName }).unwrap();
        resetForm();
        supplierNameRef.current.focus();
      } catch (err) {
        console.log('mutation error:', err.data);
        setToastMessage('errors.mutation');
        supplierNameRef.current.select();
      }
    },
    validationSchema: yup.object().shape({
      name: yup.string().trim().required()
        .min(3)
        .notOneOf(suppliers?.map(({ name }) => name) || []),
      shortName: yup.string().trim().min(3),
    }),
  });

  const toggleForm = () => setFormOpen(!formOpen);
  const focusNameInput = () => supplierNameRef.current.focus();

  return (
    <Col className="py-3">
      <Button variant="secondary" className="mb-4" onClick={toggleForm}>
        {t('elements.newSupplier')}
      </Button>
      <Collapse in={formOpen} onEntered={focusNameInput}>
        <div>
          <Row as={Form} className="pb-5" onSubmit={formik.handleSubmit}>
            <Col md={6}>
              <FloatingLabel controlId="supplierName" label={t('placeholders.name')}>
                <Form.Control
                  type="text"
                  placeholder="supplierName"
                  name="name"
                  autoComplete="organization"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.name}
                  isInvalid={formik.touched.name && !!formik.errors.name}
                  ref={supplierNameRef}
                />
                <Form.Control.Feedback type="invalid" tooltip className="end-0">
                  {t(formik.errors.name?.key, formik.errors.name?.values)}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
            <Col md={4}>
              <FloatingLabel controlId="supplierShortName" label={t('placeholders.shortName')}>
                <Form.Control
                  type="text"
                  placeholder="supplierShortName"
                  name="shortName"
                  autoComplete="organization"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.shortName}
                  isInvalid={formik.touched.shortName && !!formik.errors.shortName}
                />
                <Form.Control.Feedback type="invalid" tooltip className="end-0">
                  {t(formik.errors.shortName?.key, formik.errors.shortName?.values)}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
            <Col md={2}>
              <Button
                type="submit"
                variant="outline-info"
                className="py-3 w-100"
                disabled={!formik.isValid || formik.isSubmitting || isLoading}
              >
                {t('elements.create')}
              </Button>
            </Col>
          </Row>
        </div>
      </Collapse>
      {isLoading && <div>loading...</div>}
      {suppliers && <SupplierList suppliers={suppliers} />}
      <ToastContainer className="mb-5 pe-3 pb-5" position="bottom-end">
        <Toast show={!!toastMessage} bg="danger" onClose={() => setToastMessage(null)}>
          <Toast.Header>
            <strong className="me-auto">{t('elements.appName')}</strong>
          </Toast.Header>
          <Toast.Body>{t(toastMessage)}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Col>
  );
};

export default Suppliers;
