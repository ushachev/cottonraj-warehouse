import React, { useState, useEffect, useRef } from 'react';
import {
  Table, Modal, Form, FloatingLabel, Button, Alert,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { useUpdateSupplierMutation } from '../services/api.js';

const SupplierList = ({ suppliers }) => {
  const [updateSupplier] = useUpdateSupplierMutation();
  const [pickedSupplier, pickSupplier] = useState(null);
  const [alertShown, setAlertShown] = useState(false);
  const supplierNameRef = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    if (pickedSupplier) {
      supplierNameRef.current.select();
    }
  }, [pickedSupplier]);

  const supplierNames = suppliers
    .map(({ name }) => name)
    .filter((name) => name !== pickedSupplier?.name);

  const formik = useFormik({
    initialValues: { name: '', shortName: '' },
    initialErrors: { name: null },
    onSubmit: async ({ name, shortName }, { resetForm }) => {
      setAlertShown(false);
      try {
        await updateSupplier({ id: pickedSupplier.id, name, shortName }).unwrap();
        pickSupplier(null);
        resetForm();
      } catch (err) {
        console.log('mutation error:', err.data);
        setAlertShown(true);
        supplierNameRef.current.select();
      }
    },
    validationSchema: yup.object().shape({
      name: yup.string().trim().required()
        .min(3)
        .notOneOf(supplierNames),
      shortName: yup.string().trim().min(3),
    }),
  });

  const getSupplierClickHandler = (supplier) => () => {
    pickSupplier(supplier);
    formik.setValues({ name: supplier.name, shortName: supplier.shortName });
  };

  const handleClose = () => {
    pickSupplier(null);
    setAlertShown(false);
    formik.resetForm();
  };

  return (
    <>
      {suppliers.length === 0 ? (
        <p className="pt-3 border-top border-secondary text-center">
          {t('elements.emptyList')}
        </p>
      ) : (
        <Table striped hover className="text-reset">
          <thead>
            <tr>
              <th className="w-75">{t('placeholders.name')}</th>
              <th className="w-25">{t('placeholders.shortName')}</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                onClick={getSupplierClickHandler(supplier)}
                role="button"
                title={t('tooltips.change')}
              >
                <td>{supplier.name}</td>
                <td>{supplier.shortName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <Modal show={!!pickedSupplier} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('elements.supplier')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert
            show={alertShown}
            variant="danger"
            dismissible
            onClose={() => setAlertShown(false)}
          >
            {t('errors.mutation')}
          </Alert>
          <Form id="updateSupplierForm" onSubmit={formik.handleSubmit}>
            <FloatingLabel
              controlId="modalSupplierName"
              label={t('placeholders.name')}
              className="mb-3"
            >
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
            <FloatingLabel controlId="modalSupplierShortName" label={t('placeholders.shortName')}>
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
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-light" onClick={handleClose}>
            {t('elements.cancel')}
          </Button>
          <Button
            type="submit"
            form="updateSupplierForm"
            variant="outline-info"
            disabled={!formik.isValid || formik.isSubmitting}
          >
            {t('elements.change')}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SupplierList;
