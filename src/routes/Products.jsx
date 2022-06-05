import React, { useState, useEffect } from 'react';
import { Col, Button, Modal } from 'react-bootstrap';
import { kaReducer, Table } from 'ka-table';
import {
  DataType, SortingMode, FilteringMode, ActionType,
} from 'ka-table/enums';
import { selectRow, loadData, updateData } from 'ka-table/actionCreators';
import { kaPropsUtils } from 'ka-table/utils';
import { useOutletContext } from 'react-router-dom';
import {
  head, last, difference, isEmpty,
} from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetProductsQuery, useGetCategoriesQuery } from '../services/api.js';
import CategoryTree from '../components/CategoryTree.jsx';
import TextFilter from '../components/TextFilter.jsx';
import DataRow from '../components/DataRow.jsx';
import SelectionHeadCell from '../components/SelectionHeadCell.jsx';

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
  paging: {
    enabled: true,
    pageIndex: 0,
    pageSize: 15,
    pageSizes: [5, 15, 50],
  },
  singleAction: loadData(),
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
  const [showCategories, setShowCategories] = useState(true);
  const { products, isProductsError, isProductsLoading } = useGetProductsQuery(null, {
    selectFromResult: ({ data, isError, isLoading }) => ({
      isProductsError: isError,
      isProductsLoading: isLoading,
      products: data?.map(({ id, name, categoryId }) => ({
        id: `prod_${id}`,
        productId: id,
        name,
        categoryId,
      })).slice(0, 20),
    }),
  });
  const { categories, isCategoriesError, isCategoriesLoading } = useGetCategoriesQuery(null, {
    selectFromResult: ({ data, isError, isLoading }) => ({
      isCategoriesError: isError,
      isCategoriesLoading: isLoading,
      categories: data?.map(({ id, name, parentId: categoryId }) => ({
        id,
        name,
        categoryId,
        isCategory: true,
      })),
    }),
  });
  const [isNewQuery, setNewQuery] = useState(false);
  const [tableProps, changeTableProps] = useState(tablePropsInit);
  const { addMessageToStack } = useOutletContext();
  const { t } = useTranslation();

  const handleShowCategories = () => setShowCategories(true);
  const handleCloseCategories = () => setShowCategories(false);
  useEffect(() => {
    if (isProductsLoading || isCategoriesLoading) {
      setNewQuery(true);
    }
    if ((isProductsError || isCategoriesError) && isNewQuery) {
      addMessageToStack('errors.loading');
    }
  }, [
    isProductsError, isCategoriesError, isProductsLoading, isCategoriesLoading, isNewQuery,
    addMessageToStack,
  ]);

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
      case ActionType.LoadData: {
        dispatch(updateData(categories.concat(products)));
        break;
      }
      default: changeTableProps((prevState) => kaReducer(prevState, action));
    }
  };
  if (isCategoriesLoading || isProductsLoading) {
    return <div>loading...</div>;
  }

  return !!categories && !!products && (
    <Col className="py-3">
      <Button variant="secondary" className="mb-4" onClick={handleShowCategories}>
        {t('elements.categories')}
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
        paging={tableProps.paging}
        dispatch={dispatch}
        singleAction={tableProps.singleAction}
      />
      <Modal show={showCategories} onHide={handleCloseCategories}>
        <Modal.Header closeButton>
          <Modal.Title>{t('elements.categories')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CategoryTree />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseCategories}>
            {t('elements.close')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Col>
  );
};

export default Products;
