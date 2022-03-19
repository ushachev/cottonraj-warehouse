import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Form, Row, Col, FloatingLabel, Button,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { kaReducer, Table } from 'ka-table';
import { DataType } from 'ka-table/enums';
import { updateData } from 'ka-table/actionCreators';
import { isEmpty } from 'lodash';

import {
  useGetSuppliersQuery, useGetProductsQuery, useAddPurchaseMutation,
} from '../services/api.js';
import parsePurchaseContent from '../services/purchaseParser.js';

const tablePropsInit = {
  columns: [
    {
      key: 'number',
      title: '№',
      dataType: DataType.String,
      width: 50,
    },
    {
      key: 'name',
      title: 'Наименование',
      dataType: DataType.String,
    },
    {
      key: 'count',
      title: 'Количество',
      dataType: DataType.Number,
      width: 100,
    },
    {
      key: 'price',
      title: 'Цена',
      dataType: DataType.Number,
      width: 100,
    },
  ],
  data: [],
  rowKeyField: 'id',
  format: ({ column, value }) => {
    if (column.key === 'price') {
      return value / 100;
    }
    return undefined;
  },
};
const tableChildComponents = {
  table: {
    elementAttributes: () => ({
      className: 'table table-striped table-hover text-reset',
    }),
  },
  tableHead: {
    elementAttributes: () => ({
      className: 'border-top-0',
    }),
  },
  noDataRow: {
    content: () => 'нет данных',
  },
};

const NewPurchases = () => {
  const {
    data: suppliers, isError: isSuppliersError, isLoading: isSuppliersLoading,
  } = useGetSuppliersQuery();
  const { productIdsByBarcode, isProductsError, isProductsLoading } = useGetProductsQuery(null, {
    selectFromResult: ({ data, isError, isLoading }) => ({
      isProductsError: isError,
      isProductsLoading: isLoading,
      productIdsByBarcode: data?.reduce((acc, product) => {
        product.barcodes.forEach((barcode) => {
          acc[barcode] = product.id;
        });
        return acc;
      }, {}),
    }),
  });
  const [createPurchase] = useAddPurchaseMutation();
  const [isNewQuery, setNewQuery] = useState(false);
  const [fileValidationError, setFileValidationError] = useState(null);
  const [loadedSupplier, setLoadedSupplier] = useState('');
  const [tableProps, changeTableProps] = useState(tablePropsInit);
  const { addMessageToStack } = useOutletContext();
  const loadPurchaseRef = useRef();
  const { t } = useTranslation();

  const dispatch = (action) => {
    changeTableProps((prevState) => kaReducer(prevState, action));
  };

  useEffect(() => {
    if (isSuppliersLoading || isProductsLoading) {
      setNewQuery(true);
    }
    if ((isSuppliersError || isProductsError) && isNewQuery) {
      addMessageToStack('errors.loading');
    }
  }, [
    isSuppliersError, isProductsError, isSuppliersLoading, isProductsLoading, isNewQuery,
    addMessageToStack,
  ]);
  useEffect(() => {
    loadPurchaseRef.current?.focus();
  }, [loadPurchaseRef]);

  const formik = useFormik({
    initialValues: { number: '', date: '', supplierId: '' },
    initialErrors: { number: null },
    onSubmit: async (values, { resetForm }) => {
      const items = tableProps.data.map((item) => ({
        number: item.number,
        productId: item.productId,
        product: {
          name: item.name,
          barcodes: item.barcodes,
        },
        count: item.count,
        price: item.price,
      }));

      try {
        await createPurchase({ ...values, items }).unwrap();
        resetForm();
        dispatch(updateData([]));
        loadPurchaseRef.current.value = '';
        loadPurchaseRef.current.focus();
      } catch (err) {
        console.log('mutation error:', err.data);
        addMessageToStack('errors.mutation');
      }
    },
    validationSchema: yup.object().shape({
      number: yup.string().trim().required(),
      date: yup.string().trim().required(),
      supplierId: yup.number().required().positive().integer(),
    }),
  });

  const handleFileChange = ({ target: { files: [file] } }) => {
    setFileValidationError(null);

    if (!file) return;

    if (file.type !== 'text/xml') {
      setFileValidationError('errors.validation.wrongFileFormat');
      return;
    }

    const reader = new FileReader();
    reader.onload = ({ target: { result } }) => {
      const purchase = parsePurchaseContent(result);

      if (!purchase) {
        setFileValidationError('errors.validation.wrongFileFormat');
        return;
      }

      const supplier = suppliers.find(({ name }) => purchase.supplier
        .toLowerCase().includes(name.toLowerCase()));
      formik.setValues({
        number: purchase.number,
        date: purchase.date,
        supplierId: supplier?.id || '',
      });
      setLoadedSupplier(purchase.supplier);
      dispatch(updateData(purchase.products.map((product) => {
        const productId = product.barcodes
          .map((bc) => productIdsByBarcode[bc])
          .find((id) => id);

        return {
          id: product.number,
          productId: productId || null,
          ...product,
        };
      })));
    };

    reader.readAsText(file, 'windows-1251');
  };

  return isSuppliersLoading || isProductsLoading
    ? <div>loading...</div>
    : (
      <Col className="py-3">
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group as={Row} controlId="formFile" className="mb-3">
            <Form.Label column md="auto">{t('labels.upload')}</Form.Label>
            <Col md={6} className="position-relative">
              <Form.Control
                type="file"
                accept=".xml"
                onChange={handleFileChange}
                isInvalid={!!fileValidationError}
                ref={loadPurchaseRef}
              />
              <Form.Control.Feedback type="invalid" tooltip className="end-0 me-3">
                {t(fileValidationError)}
              </Form.Control.Feedback>
            </Col>
          </Form.Group>
          <Row className="mb-4">
            <Col md={2}>
              <FloatingLabel controlId="number" label={t('labels.number')}>
                <Form.Control
                  type="text"
                  placeholder="number"
                  name="number"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.number}
                  isInvalid={formik.touched.number && !!formik.errors.number}
                />
                <Form.Control.Feedback type="invalid" tooltip className="end-0">
                  {t(formik.errors.number?.key)}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
            <Col md={2}>
              <FloatingLabel controlId="date" label={t('labels.date')}>
                <Form.Control
                  type="text"
                  placeholder="date"
                  name="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.date}
                  isInvalid={formik.touched.date && !!formik.errors.date}
                />
                <Form.Control.Feedback type="invalid" tooltip className="end-0">
                  {t(formik.errors.date?.key)}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
            <Col md={8}>
              <FloatingLabel controlId="floatingSelectGrid" label={t('labels.supplier')}>
                <Form.Select
                  name="supplierId"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.supplierId}
                  isInvalid={formik.touched.supplierId && !!formik.errors.supplierId}
                >
                  <option>{t('placeholders.select')}</option>
                  {suppliers?.map(({ id, shortName }) => (
                    <option key={id} value={id}>{shortName}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid" tooltip className="end-0 me-3">
                  {t(formik.errors.supplierId?.key)}
                </Form.Control.Feedback>
              </FloatingLabel>
              <Form.Text muted>{loadedSupplier}</Form.Text>
            </Col>
          </Row>
          <Row>
            <Col>
              <Table
                columns={tableProps.columns}
                data={tableProps.data}
                rowKeyField={tableProps.rowKeyField}
                format={tableProps.format}
                childComponents={tableChildComponents}
                dispatch={dispatch}
              />
              <Button
                type="submit"
                variant="outline-info"
                disabled={!formik.isValid || formik.isSubmitting || isEmpty(tableProps.data)}
              >
                {t('elements.create')}
              </Button>
            </Col>
          </Row>
        </Form>
      </Col>
    );
};

export default NewPurchases;
