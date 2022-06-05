import React from 'react';
import {
  selectRowsRange, selectRow, deselectRow, updateTreeGroupsExpanded,
} from 'ka-table/actionCreators';
import defaultOptions from 'ka-table/defaultOptions';
import { uniqueId } from 'lodash';

const { css: defaultCss } = defaultOptions;

const DataRow = ({
  rowData,
  dispatch,
  rowKeyValue,
  isSelectedRow,
  isTreeGroup,
  isTreeExpanded,
  treeDeep,
}) => (
  <>
    <td className={defaultCss.cell}>
      <div className={defaultCss.cellText}>
        {!rowData.isCategory && (
          <input
            type="checkbox"
            className="form-check-input align-text-bottom"
            checked={isSelectedRow}
            onChange={(event) => {
              if (event.nativeEvent.shiftKey) {
                dispatch(selectRowsRange(rowKeyValue));
              } else if (event.currentTarget.checked) {
                dispatch(selectRow(rowKeyValue));
              } else {
                dispatch(deselectRow(rowKeyValue));
              }
            }}
          />
        )}
      </div>
    </td>
    <td className={`${defaultCss.cell} ${defaultCss.treeCell}`}>
      {!!treeDeep && Array(treeDeep).fill('').map(() => (
        <div key={uniqueId('empty_')} className={defaultCss.treeCellEmptySpace} />
      ))}
      {isTreeGroup && (
        <div
          aria-hidden="true"
          onClick={() => dispatch(updateTreeGroupsExpanded(rowKeyValue))}
          className={isTreeExpanded
            ? defaultCss.iconTreeArrowExpanded : defaultCss.iconTreeArrowCollapsed}
        />
      )}
      <div className={`${defaultCss.cellText}${rowData.isCategory ? ' fw-bolder' : ''}`}>
        {rowData.name}
      </div>
    </td>
  </>
);

export default DataRow;
