import React from 'react';
import { Form } from 'react-bootstrap';
import { updateFilterRowValue } from 'ka-table/actionCreators';
import { kaDateUtils } from 'ka-table/utils';

const TextFilter = ({ column, dispatch }) => {
  const fieldValue = column.filterRowValue;
  const value = fieldValue && kaDateUtils.getDateInputValue(fieldValue);

  return (
    <Form.Control
      type="date"
      value={value || ''}
      style={{ width: 155 }}
      onChange={({ currentTarget: { value: targetValue } }) => {
        const filterValue = targetValue ? new Date(targetValue) : null;
        dispatch(updateFilterRowValue(column.key, filterValue));
      }}
    />
  );
};

export default TextFilter;
