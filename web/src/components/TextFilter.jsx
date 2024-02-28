import React from 'react';
import { Form } from 'react-bootstrap';
import { updateFilterRowValue } from 'ka-table/actionCreators';

const TextFilter = ({ column, dispatch }) => (
  <Form.Control
    type="text"
    className="w-75"
    defaultValue={column.filterRowValue}
    onChange={({ currentTarget: { value } }) => {
      const filterValue = value !== '' ? value : null;
      dispatch(updateFilterRowValue(column.key, filterValue));
    }}
  />
);

export default TextFilter;
