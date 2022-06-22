import React, { useState, useEffect } from 'react';
import { Col, Button } from 'react-bootstrap';
import { AiOutlineEdit } from 'react-icons/ai';
import { kaReducer, Table } from 'ka-table';
import {
  DataType, SortingMode, FilteringMode, ActionType,
} from 'ka-table/enums';
import {
  selectRow, updateData, showLoading, hideLoading, deselectAllRows, updateTreeGroupsExpanded,
} from 'ka-table/actionCreators';
import { kaPropsUtils } from 'ka-table/utils';
import { useOutletContext } from 'react-router-dom';
import { useMachine } from '@xstate/react';
import {
  head, last, difference, isEmpty, keyBy,
} from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetProductsQuery, useGetCategoriesQuery } from '../services/api.js';
import fetchCatalogMachine from '../services/fetchCatalogMachine.js';
import TextFilter from '../components/TextFilter.jsx';
import DataRow from '../components/DataRow.jsx';
import SelectionHeadCell from '../components/SelectionHeadCell.jsx';
import ProductModal from '../components/ProductModal.jsx';

const EXPAND_TO_ROOT = 'EXPAND_TO_ROOT';
const UPDATE_PAGE_INDEX_TO_ITEM = 'UPDATE_PAGE_INDEX_TO_ITEM';

const tablePropsInit = {
  columns: [
    { key: 'selection-cell', width: 48 },
    { key: 'name', title: 'Наименование', dataType: DataType.String },
  ],
  data: [],
  rowKeyField: 'id',
  treeGroupKeyField: 'categoryId',
  treeGroupsExpanded: [],
  selectedRows: [],
  sortingMode: SortingMode.None,
  filteringMode: FilteringMode.FilterRow,
  loading: {
    enabled: false,
  },
  paging: {
    enabled: true,
    pageIndex: 0,
    pageSize: 15,
    pageSizes: [5, 15, 50],
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
      className: 'border-top-0 align-middle',
    }),
  },
  dataRow: {
    content: (props) => (
      <DataRow
        rowData={props.rowData}
        dispatch={props.dispatch}
        rowKeyValue={props.rowKeyValue}
        isSelectedRow={props.isSelectedRow}
        isTreeGroup={props.isTreeGroup}
        isTreeExpanded={props.isTreeExpanded}
        treeDeep={props.treeDeep}
      />
    ),
  },
  headCell: {
    content: ({ column, dispatch }) => {
      if (column.key === 'selection-cell') {
        return <SelectionHeadCell dispatch={dispatch} />;
      }
      return null;
    },
  },
  noDataRow: {
    content: () => 'нет данных',
  },
  filterRowCell: {
    content: ({ column, dispatch }) => {
      const getEditor = () => {
        switch (column.key) {
          case 'name': return <TextFilter column={column} dispatch={dispatch} />;
          default: return null;
        }
      };
      return (
        <div className="d-flex">{getEditor()}</div>
      );
    },
  },
  pagingIndex: {
    elementAttributes: ({ isActive }) => ({
      className: `page-item ${(isActive ? 'active' : '')}`,
    }),
    content: ({ text }) => <div className="page-link">{text}</div>,
  },
  pagingPages: {
    elementAttributes: () => ({
      className: 'pagination',
    }),
  },
  pagingSize: {
    elementAttributes: () => ({
      className: 'me-1',
    }),
    content: ({ pageSize, value }) => (
      <Button variant={`${pageSize === value ? '' : 'outline-'}success`} size="sm">
        {value}
      </Button>
    ),
  },
};

const Products = () => {
  const {
    products, isProductsLoading, isProductsFetching, isProductSuccess, isProductsError,
  } = useGetProductsQuery(null, {
    selectFromResult: ({
      data, isLoading, isFetching, isSuccess, isError,
    }) => ({
      isProductsLoading: isLoading,
      isProductsFetching: isFetching,
      isProductSuccess: isSuccess,
      isProductsError: isError,
      products: data?.map(({ id, name, categoryId }) => ({
        id: `prod_${id}`,
        productId: id,
        name,
        categoryId,
      })),
    }),
  });
  const {
    categories, isCategoriesLoading, isCategoriesFetching, isCategoriesSuccess, isCategoriesError,
    categoriesById,
  } = useGetCategoriesQuery(null, {
    selectFromResult: ({
      data, isLoading, isFetching, isSuccess, isError,
    }) => {
      const pickedData = data?.map(({ id, name, parentId: categoryId }) => ({
        id,
        name,
        categoryId,
        isCategory: true,
      }));

      return {
        isCategoriesLoading: isLoading,
        isCategoriesFetching: isFetching,
        isCategoriesSuccess: isSuccess,
        isCategoriesError: isError,
        categories: pickedData,
        categoriesById: keyBy(pickedData, 'id'),
      };
    },
  });
  const [tableProps, changeTableProps] = useState(tablePropsInit);

  const dispatch = (action) => {
    switch (action.type) {
      case ActionType.SelectRowsRange: {
        const shownDataIds = kaPropsUtils.getData(tableProps).map(({ rowData: { id } }) => id);
        const selectedDataIds = kaPropsUtils.getSelectedData(tableProps).map(({ id }) => id);

        const selectedHeadIndex = shownDataIds.findIndex((id) => id === head(selectedDataIds));
        const selectedLastIndex = shownDataIds.findIndex((id) => id === last(selectedDataIds));
        const rowKeyValueFromIndex = shownDataIds.findIndex((id) => id === action.rowKeyValueFrom);

        const start = Math.min(rowKeyValueFromIndex, selectedHeadIndex);
        const end = Math.max(rowKeyValueFromIndex, selectedLastIndex);
        const idsToSelect = shownDataIds.slice(start, end + 1);

        difference(idsToSelect, selectedDataIds).forEach((id) => dispatch(selectRow(id)));
        break;
      }
      case ActionType.UpdatePageIndex: {
        dispatch(deselectAllRows());
        changeTableProps((prevState) => ({
          ...prevState,
          paging: { ...prevState.paging, pageIndex: action.pageIndex },
        }));
        break;
      }
      case EXPAND_TO_ROOT: {
        const { categoryId } = action;

        if (!categoryId) break;

        if (!tableProps.treeGroupsExpanded.includes(categoryId)) {
          dispatch(updateTreeGroupsExpanded(categoryId));
        }

        const { categoryId: parentCategoryId } = categoriesById[categoryId];

        if (parentCategoryId) {
          dispatch({ type: EXPAND_TO_ROOT, categoryId: parentCategoryId });
        }
        break;
      }
      case UPDATE_PAGE_INDEX_TO_ITEM: {
        changeTableProps((prevState) => {
          const findPageIndex = (pageIndex = 0) => {
            const shownDataIds = kaPropsUtils.getData({
              ...prevState,
              paging: { ...prevState.paging, pageIndex },
            }).map(({ rowData: { productId } }) => productId);

            if (isEmpty(shownDataIds)) return 0;

            return shownDataIds.includes(action.id)
              ? pageIndex
              : findPageIndex(pageIndex + 1);
          };

          return {
            ...prevState,
            paging: { ...prevState.paging, pageIndex: findPageIndex() },
          };
        });
        break;
      }
      default: changeTableProps((prevState) => kaReducer(prevState, action));
    }
  };

  const [modalVariant, setModalVariant] = useState(null);
  const { addMessageToStack } = useOutletContext();
  const { t } = useTranslation();
  const [, send] = useMachine(fetchCatalogMachine, {
    actions: {
      updateData: () => {
        const nextData = categories.concat(products);
        dispatch(updateData(nextData));

        const selectedItem = head(kaPropsUtils.getSelectedData({ ...tableProps, data: nextData }));
        if (selectedItem) {
          dispatch({ type: EXPAND_TO_ROOT, categoryId: selectedItem.categoryId });
          dispatch({ type: UPDATE_PAGE_INDEX_TO_ITEM, id: selectedItem.productId });
        }
      },
      showLoading: () => dispatch(showLoading()),
      hideLoading: () => !isProductsFetching && !isCategoriesFetching && dispatch(hideLoading()),
      sendMessage: (_, { resource }) => addMessageToStack(t('errors.loading', { resource: t(resource) })),
    },
    guards: {
      areAllSuccess: () => isProductSuccess && isCategoriesSuccess,
    },
  });

  useEffect(() => {
    isProductsLoading && send('LOAD.products');
    isCategoriesLoading && send('LOAD.categories');
    (isProductsFetching || isCategoriesFetching) && send('FETCH');
    (!isProductsFetching && !isCategoriesFetching) && send('NOFETCH');
    isProductSuccess && send('RESOLVE.products');
    isCategoriesSuccess && send('RESOLVE.categories');
    (isProductSuccess && isCategoriesSuccess) && send('RESOLVE');
    isProductsError && send({ type: 'REJECT.products', resource: 'elements.products' });
    isCategoriesError && send({ type: 'REJECT.categories', resource: 'elements.categories' });
  }, [
    isProductsLoading, isProductsFetching, isProductSuccess, isProductsError, send,
    isCategoriesLoading, isCategoriesFetching, isCategoriesSuccess, isCategoriesError,
  ]);

  const selectedItems = kaPropsUtils.getSelectedData(tableProps);

  return (
    <Col className="py-3">
      <Button
        disabled={isEmpty(selectedItems)}
        variant="secondary"
        className="ms-2 mb-3"
        onClick={() => setModalVariant(selectedItems.length > 1 ? 'batchEditing' : 'singleEditing')}
      >
        <AiOutlineEdit size="1.5em" />
        <span className="ms-1">{t('elements.editSelected')}</span>
      </Button>
      <Table
        columns={tableProps.columns}
        data={tableProps.data}
        rowKeyField={tableProps.rowKeyField}
        treeGroupKeyField={tableProps.treeGroupKeyField}
        treeGroupsExpanded={tableProps.treeGroupsExpanded}
        selectedRows={tableProps.selectedRows}
        sortingMode={tableProps.sortingMode}
        filteringMode={tableProps.filteringMode}
        childComponents={tableChildComponents}
        loading={tableProps.loading}
        paging={tableProps.paging}
        dispatch={dispatch}
      />
      {!!modalVariant && (
        <ProductModal
          variant={modalVariant}
          onHide={() => setModalVariant(null)}
          selectedItems={selectedItems}
          products={products}
          categories={categoriesById}
        />
      )}
    </Col>
  );
};

export default Products;
