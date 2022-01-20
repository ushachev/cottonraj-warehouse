import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Logo from '../components/Logo.jsx';
import Menu from '../components/Menu.jsx';
import Header from '../components/Header.jsx';

const Root = () => {
  const { t } = useTranslation();

  return (
    <Container fluid className="d-flex flex-column h-100 py-3">
      <Row className="flex-grow-1">
        <Col as="aside" xs="auto" className="ps-3 pe-2">
          <div className="h-100 p-3 bg-dark">
            <Logo className="mb-3" />
            <Menu className="border-top" />
          </div>
        </Col>
        <Col className="ps-2 pe-3">
          <Header />
          <Row>
            <Outlet />
          </Row>
        </Col>
      </Row>
      <footer className="d-flex mt-3 mx-1 py-3 px-4 bg-dark">
        <Col xs="auto" className="ms-auto text-muted">
          <span>{t('elements.author')}</span>
        </Col>
      </footer>
    </Container>
  );
};

export default Root;
