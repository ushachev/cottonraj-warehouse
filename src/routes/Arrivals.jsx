import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Col, Button } from 'react-bootstrap';
import { kaReducer, Table } from 'ka-table';
import {
  DataType, SortingMode, SortDirection, FilteringMode,
} from 'ka-table/enums';
import { updateData, showLoading, hideLoading } from 'ka-table/actionCreators';
import { useMachine } from '@xstate/react';
import { uniqueId } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetPurchasesQuery } from '../services/api.js';
import fetchArrivalsMachine from '../services/fetchArrivalsMachine.js';
import TextFilter from '../components/TextFilter.jsx';
import DateFilter from '../components/DateFilter.jsx';

const tablePropsInit = {
  columns: [
    {
      key: 'name',
      title: 'наименование',
      dataType: DataType.String,
    },
    {
      key: 'count',
      title: 'количество',
      dataType: DataType.Number,
      width: 100,
    },
    {
      key: 'price',
      title: 'цена',
      dataType: DataType.Number,
      width: 100,
    },
    {
      key: 'purchaseNumber',
      title: '№',
      dataType: DataType.String,
      width: 100,
    },
    {
      key: 'purchaseDate',
      title: 'дата',
      dataType: DataType.Date,
      sortDirection: SortDirection.Descend,
      filterRowOperator: '<=',
      width: 150,
    },
    {
      key: 'itemNumber',
      title: 'строка',
      dataType: DataType.String,
      width: 50,
    },
    {
      key: 'supplierName',
      title: 'поставщик',
      dataType: DataType.String,
      width: 150,
    },
  ],
  groupedColumns: [
    {
      key: 'purchase',
      title: 'документ',
      columnsKeys: ['purchaseNumber', 'purchaseDate', 'itemNumber', 'supplierName'],
    },
  ],
  data: [],
  rowKeyField: 'id',
  format: ({ column, value }) => {
    if (column.key === 'price') {
      return value / 100;
    }
    if (column.dataType === DataType.Date) {
      return value?.toLocaleDateString('ru', { month: '2-digit', day: '2-digit', year: 'numeric' });
    }
    return undefined;
  },
  sortingMode: SortingMode.Single,
  filteringMode: FilteringMode.FilterRow,
  loading: {
    enabled: false,
  },
  paging: {
    enabled: true,
    pageIndex: 0,
    pageSize: 10,
    pageSizes: [5, 10, 50],
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
  noDataRow: {
    content: () => 'нет данных',
  },
  filterRowCell: {
    content: ({ column, dispatch }) => {
      const getEditor = () => {
        switch (column.key) {
          case 'name': return <TextFilter column={column} dispatch={dispatch} />;
          case 'purchaseDate': return <DateFilter column={column} dispatch={dispatch} />;
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

const Arrivals = () => {
  const [tableProps, changeTableProps] = useState(tablePropsInit);

  const dispatch = (action) => {
    changeTableProps((prevState) => kaReducer(prevState, action));
  };

  const {
    arrivals, isArrivalsLoading, isArrivalSuccess, isArrivalsError,
  } = useGetPurchasesQuery(null, {
    selectFromResult: ({
      data, isLoading, isSuccess, isError,
    }) => ({
      isArrivalsLoading: isLoading,
      isArrivalSuccess: isSuccess,
      isArrivalsError: isError,
      arrivals: data?.flatMap(({
        number, date, supplier: { shortName }, items,
      }) => items.map((item) => ({
        id: uniqueId('row_'),
        name: item.product.name,
        count: item.count,
        price: item.price,
        purchaseNumber: number,
        purchaseDate: date,
        itemNumber: item.number,
        supplierName: shortName,
      }))),
    }),
  });
  const { addMessageToStack } = useOutletContext();
  const { t } = useTranslation();
  const [, send] = useMachine(fetchArrivalsMachine, {
    actions: {
      updateData: () => dispatch(updateData(arrivals)),
      showLoading: () => dispatch(showLoading()),
      hideLoading: () => dispatch(hideLoading()),
      sendMessage: () => addMessageToStack(t('errors.loading', { resource: t('elements.purchases') })),
    },
  });

  useEffect(() => {
    isArrivalsLoading && send('LOAD');
    isArrivalSuccess && send('RESOLVE');
    isArrivalsError && send('REJECT');
  }, [
    isArrivalsLoading, isArrivalSuccess, isArrivalsError, send,
  ]);

  return (
    <Col className="py-3">
      <Table
        columns={tableProps.columns}
        groupedColumns={tableProps.groupedColumns}
        data={tableProps.data}
        rowKeyField={tableProps.rowKeyField}
        format={tableProps.format}
        sortingMode={tableProps.sortingMode}
        filteringMode={tableProps.filteringMode}
        childComponents={tableChildComponents}
        loading={tableProps.loading}
        paging={tableProps.paging}
        dispatch={dispatch}
      />
    </Col>
  );
};

export default Arrivals;
