import React from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Row, Col, Button,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="h-100">
      <Row className="justify-content-center align-content-center h-100">
        <Col xs="auto" className="text-center">
          <h1 className="title-404 mb-md-5 lh-1 fw-bold">404</h1>
          <h2 className="mb-5 fw-light">{t('elements.pageNotFound')}</h2>
          <Button as={Link} to="/" variant="outline-light" size="lg">
            {t('elements.backToMain')}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
