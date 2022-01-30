import React from 'react';

import { useGetSuppliersQuery } from '../services/api.js';

const Suppliers = () => {
  const { data: suppliers } = useGetSuppliersQuery();
  console.log('suppliers:', suppliers);

  return (
    <div>
      <h1>поставщики</h1>
    </div>
  );
};

export default Suppliers;
