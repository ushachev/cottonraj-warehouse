import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Container, Row, Col, ToastContainer, Toast,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { uniqueId } from 'lodash';

import Logo from '../components/Logo.jsx';
import Menu from '../components/Menu.jsx';
import Header from '../components/Header.jsx';

const Root = () => {
  const [messageStack, setMessageStack] = useState([]);
  const { t } = useTranslation();

  useEffect(() => () => setMessageStack([]), []);

  const addMessageToStack = useCallback((message) => {
    setMessageStack((prevStack) => [{ id: uniqueId('message_'), message }, ...prevStack]);
  }, []);
  const removeMessageFromStack = (id) => () => {
    setMessageStack((prevStack) => prevStack.filter((message) => message.id !== id));
  };

  return (
    <Container fluid className="d-flex flex-column h-100 py-3 text-body text-opacity-75">
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
            <Outlet context={{ addMessageToStack }} />
          </Row>
        </Col>
      </Row>
      <footer className="d-flex mt-3 mx-1 py-3 px-4 bg-dark">
        <Col xs="auto" className="ms-auto text-muted">
          <span>{t('elements.author')}</span>
        </Col>
      </footer>
      <ToastContainer className="mb-5 pe-3 pb-5" position="bottom-end">
        {messageStack.map(({ id, message }) => (
          <Toast key={id} bg="danger" onClose={removeMessageFromStack(id)}>
            <Toast.Header>
              <strong className="me-auto">{t('elements.appName')}</strong>
            </Toast.Header>
            <Toast.Body>{t(message)}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </Container>
  );
};

export default Root;
