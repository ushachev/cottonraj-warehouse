import React, { useState } from 'react';
import { Col, Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import CategoryTree from '../components/CategoryTree.jsx';

const Products = () => {
  const [showCategories, setShowCategories] = useState(true);
  const { t } = useTranslation();

  const handleShowCategories = () => setShowCategories(true);
  const handleCloseCategories = () => setShowCategories(false);

  return (
    <Col className="py-3">
      <Button variant="secondary" className="mb-4" onClick={handleShowCategories}>
        {t('elements.categories')}
      </Button>
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
