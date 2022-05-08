import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ControlledTreeEnvironment, Tree } from 'react-complex-tree';
import { isEmpty, takeRight } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetCategoriesQuery } from '../services/api.js';

const CategoryTree = () => {
  const { categories, isCategoriesError, isCategoriesLoading } = useGetCategoriesQuery(null, {
    selectFromResult: ({ data, isError, isLoading }) => ({
      isCategoriesError: isError,
      isCategoriesLoading: isLoading,
      categories: (data || []).reduce((acc, category) => {
        acc[category.id] = {
          index: category.id,
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
  const [isNewQuery, setNewQuery] = useState(false);
  const [focusedItem, setFocusedItem] = useState();
  const [expandedItems, setExpandedItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const { addMessageToStack } = useOutletContext();
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

  if (isCategoriesLoading) {
    return <div>loading...</div>;
  }

  return isEmpty(categories.root.children)
    ? <p className="text-center">{t('elements.emptyList')}</p>
    : (
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
        onFocusItem={({ index }) => setFocusedItem(index)}
        onExpandItem={({ index }) => setExpandedItems([...expandedItems, index])}
        onCollapseItem={({ index }) => setExpandedItems(
          expandedItems.filter((expandedItemIndex) => expandedItemIndex !== index),
        )}
        onSelectItems={(indexes) => setSelectedItems(takeRight(indexes))}
      >
        <Tree treeId="categories" rootItem="root" treeLabel="Categories tree" />
      </ControlledTreeEnvironment>
    );
};

export default CategoryTree;
