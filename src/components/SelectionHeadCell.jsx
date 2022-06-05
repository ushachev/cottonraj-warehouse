import React from 'react';
import { Button } from 'react-bootstrap';
import { AiOutlineSelect } from 'react-icons/ai';
import { deselectAllRows } from 'ka-table/actionCreators';
import { useTranslation } from 'react-i18next';

const SelectionHeadCell = ({ dispatch }) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="contained"
      size="sm"
      className="p-0 border-0"
      onClick={() => dispatch(deselectAllRows())}
      title={t('tooltips.deselect')}
    >
      <AiOutlineSelect size="1.5em" />
    </Button>
  );
};

export default SelectionHeadCell;
