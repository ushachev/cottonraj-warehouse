import React from 'react';
import {
  Row, Col, Breadcrumb, Dropdown, DropdownButton,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

import useAuth from '../hooks/useAuth.js';

const Header = () => {
  const auth = useAuth();
  const { username } = JSON.parse(localStorage.getItem('user'));

  return (
    <header className="bg-dark">
      <Row>
        <Col className="py-3">
          <Breadcrumb listProps={{ className: 'mb-0 bg-transparent' }} className="ps-1">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>главная</Breadcrumb.Item>
            <Breadcrumb.Item href="#">товары</Breadcrumb.Item>
            <Breadcrumb.Item active>каталог</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col xs="auto" className="py-3">
          <DropdownButton
            align="end"
            title={username}
            variant="contained"
            renderMenuOnMount
            className="me-3"
          >
            <Dropdown.Item as="button">Аккаунт</Dropdown.Item>
            <Dropdown.Item as="button" onClick={auth.logOut}>Выйти</Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>
    </header>
  );
};

export default Header;
