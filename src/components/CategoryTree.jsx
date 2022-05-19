import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Collapse, Row, Form, Col, Alert,
} from 'react-bootstrap';
import { useOutletContext } from 'react-router-dom';
import { ControlledTreeEnvironment, Tree } from 'react-complex-tree';
import { isEmpty, takeRight, head } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  useGetCategoriesQuery, useAddCategoryMutation, useUpdateCategoryMutation,
} from '../services/api.js';

const CategoryTree = () => {
  const { categories, isCategoriesError, isCategoriesLoading } = useGetCategoriesQuery(null, {
    selectFromResult: ({ data, isError, isLoading }) => ({
      isCategoriesError: isError,
      isCategoriesLoading: isLoading,
      categories: (data || []).reduce((acc, category) => {
        acc[category.id] = {
          index: category.id,
          parentId: category.parentId,
          hasChildren: !isEmpty(category.children),
          children: category.children,
          name: category.name,
        };

        if (category.parentId === null) {
          acc.root.children.push(category.id);
        }

        return acc;
      }, {
        root: {
          index: 'root',
          hasChildren: true,
          children: [],
          name: 'Root item',
        },
      }),
    }),
  });
  const [createCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [isNewQuery, setNewQuery] = useState(false);
  const [focusedItem, setFocusedItem] = useState();
  const [expandedItems, setExpandedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [addCategoryFormOpen, setAddCategoryFormOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const { addMessageToStack } = useOutletContext();
  const categoryNameRef = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    if (isCategoriesLoading) {
      setNewQuery(true);
    }
    if (isCategoriesError && isNewQuery) {
      addMessageToStack('errors.loading');
    }
  }, [
    isCategoriesError, isCategoriesLoading, isNewQuery, addMessageToStack,
  ]);

  const getValidationSchema = (parentId) => yup.object().shape({
    name: yup.string().trim().required()
      .min(3)
      .notOneOf(categories[parentId || 'root'].children
        .map((id) => categories[id].name)),
  });

  const formik = useFormik({
    initialValues: { name: '' },
    initialErrors: { name: null },
    onSubmit: async ({ name }) => {
      try {
        const parentId = head(selectedItems);
        await createCategory({ name, parentId }).unwrap();
        setAddCategoryFormOpen(false);
        setExpandedItems([...expandedItems, parentId]);
      } catch (err) {
        console.log('mutation error:', err.data);
        setAlert({ variant: 'danger', message: 'errors.mutation' });
        categoryNameRef.current.select();
      }
    },
    validationSchema: getValidationSchema(head(selectedItems)),
  });

  const handleOpenAddCategory = () => {
    formik.resetForm();
    setAddCategoryFormOpen(true);
  };
  const handleCloseAddCategory = () => setAddCategoryFormOpen(false);
  const handleDeleteCategory = () => {};
  const focusCategoryName = () => categoryNameRef.current.focus();
  const canDropAt = ([item], { targetType, parentItem, targetItem = 'root' }) => {
    const canDropByItem = item.parentId === null
      ? targetType === 'item'
      : targetType === 'item' || parentItem === 'root';
    const canDropByTarget = !categories[targetItem].children
      .find((id) => categories[id].name === item.name);

    return canDropByItem && canDropByTarget;
  };
  const onCollapseItem = ({ index }) => setExpandedItems(
    expandedItems.filter((expandedItemIndex) => expandedItemIndex !== index),
  );
  const onSelectItems = (indexes) => {
    setAddCategoryFormOpen(false);
    setSelectedItems(takeRight(indexes));
  };
  const onRenameItem = async (item, name) => {
    if (item.name === name) return;
    try {
      await getValidationSchema(item.parentId).validate({ name });
      await updateCategory({ id: item.index, name }).unwrap();
    } catch (err) {
      if (err.name === 'ValidationError') {
        setAlert({
          variant: 'danger',
          message: t(err.message.key, err.message.values),
        });
        return;
      }
      console.log('mutation error:', err.data);
      setAlert({ variant: 'danger', message: t('errors.mutation') });
    }
  };
  const onDrop = async ([{ index }], { targetItem = null }) => {
    try {
      await updateCategory({ id: index, parentId: targetItem }).unwrap();
    } catch (err) {
      console.log('mutation error:', err.data);
      setAlert({ variant: 'danger', message: t('errors.mutation') });
    }
  };

  if (isCategoriesLoading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <Alert
        show={!!alert}
        variant={alert?.variant}
        dismissible
        onClose={() => setAlert(null)}
      >
        {alert?.message}
      </Alert>
      <Button variant="outline-light" size="sm" onClick={handleOpenAddCategory}>
        {t('elements.add')}
      </Button>
      <Button
        variant="outline-danger"
        size="sm"
        className="ms-2"
        onClick={handleDeleteCategory}
        disabled={isEmpty(selectedItems) || categories[head(selectedItems)].hasChildren}
      >
        {t('elements.delete')}
      </Button>
      <Collapse in={addCategoryFormOpen} onEntered={focusCategoryName}>
        <div>
          <Row as={Form} className="pt-2 pb-1" onSubmit={formik.handleSubmit}>
            <Form.Group as={Col} className="position-relative">
              <Form.Label htmlFor="categoryName" visuallyHidden>
                {t('labels.name')}
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                name="name"
                id="categoryName"
                placeholder={t('placeholders.newCategory')}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                isInvalid={formik.touched.name && !!formik.errors.name}
                ref={categoryNameRef}
              />
              <Form.Control.Feedback type="invalid" tooltip className="end-0 me-3">
                {t(formik.errors.name?.key, formik.errors.name?.values)}
              </Form.Control.Feedback>
            </Form.Group>
            <Col xs="auto">
              <Button
                type="submit"
                size="sm"
                variant="info"
                disabled={!formik.isValid || formik.isSubmitting}
              >
                {t('elements.create')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="ms-2"
                onClick={handleCloseAddCategory}
              >
                {t('elements.cancel')}
              </Button>
            </Col>
          </Row>
        </div>
      </Collapse>
      {isEmpty(categories.root.children)
        ? <p className="mt-3 text-center">{t('elements.emptyList')}</p>
        : (
          <div className="mt-1 pt-2 border-top border-secondary">
            <ControlledTreeEnvironment
              items={categories}
              getItemTitle={({ name }) => name}
              viewState={{
                categories: {
                  focusedItem,
                  expandedItems,
                  selectedItems,
                },
              }}
              canDragAndDrop
              canReorderItems
              canDropOnItemWithChildren
              canDropOnItemWithoutChildren
              canDropAt={canDropAt}
              onFocusItem={({ index }) => setFocusedItem(index)}
              onExpandItem={({ index }) => setExpandedItems([...expandedItems, index])}
              onCollapseItem={onCollapseItem}
              onSelectItems={onSelectItems}
              onRenameItem={onRenameItem}
              onDrop={onDrop}
            >
              <Tree treeId="categories" rootItem="root" treeLabel="Categories tree" />
            </ControlledTreeEnvironment>
          </div>
        )}
    </div>
  );
};

export default CategoryTree;
