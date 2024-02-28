import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  Container, Row, Col, Form, FloatingLabel, Button, ToastContainer, Toast,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import axios from 'axios';

import useAuth from '../hooks/useAuth.js';
import routes, { baseURL } from '../routes.js';

const http = axios.create({ baseURL });

const Login = () => {
  const [authError, setAuthError] = useState(null);
  const usernameRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    initialErrors: { username: null },
    onSubmit: async ({ username, password }) => {
      setAuthError(null);
      try {
        const { data } = await http.post(routes.login(), { username, password });
        const from = location.state?.from?.pathname || '/';

        auth.logIn(data);
        navigate(from, { replace: true });
      } catch (err) {
        if (!err.isAxiosError || err.response.status !== 401) {
          setAuthError('errors.smthWentWrong');
          return;
        }

        setAuthError('errors.auth.invalidLoginOrPassword');
        usernameRef.current.select();
      }
    },
    validationSchema: yup.object().shape({
      username: yup.string().trim().required(),
      password: yup.string().trim().required(),
    }),
  });

  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  const closeToast = () => setAuthError(null);

  return (
    <Container fluid className="h-100">
      <Row className="justify-content-center align-items-center h-100">
        <Col sm={10} md={8} lg={6} xl={5} xxl={4} className="mb-5">
          <Form onSubmit={formik.handleSubmit} className="px-5 py-3">
            <FloatingLabel
              controlId="username"
              label={t('placeholders.login')}
              className="mb-3"
            >
              <Form.Control
                type="text"
                placeholder="username"
                name="username"
                autoComplete="username"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
                isInvalid={formik.touched.username && !!formik.errors.username}
                ref={usernameRef}
              />
              <Form.Control.Feedback type="invalid" tooltip className="end-0">
                {t(formik.errors.username?.key)}
              </Form.Control.Feedback>
            </FloatingLabel>
            <FloatingLabel
              controlId="password"
              label={t('placeholders.password')}
              className="mb-4"
            >
              <Form.Control
                type="password"
                placeholder="password"
                name="password"
                autoComplete="current-password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                isInvalid={formik.touched.password && !!formik.errors.password}
              />
              <Form.Control.Feedback type="invalid" tooltip className="end-0">
                {t(formik.errors.password?.key)}
              </Form.Control.Feedback>
            </FloatingLabel>
            <Button
              type="submit"
              variant="outline-info"
              size="lg"
              className="w-100"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              {t('elements.login')}
            </Button>
          </Form>
        </Col>
      </Row>
      <ToastContainer className="mt-5 p-3" position="top-center">
        <Toast show={!!authError} bg="danger" onClose={closeToast}>
          <Toast.Header>
            <strong className="me-auto">{t('elements.appName')}</strong>
          </Toast.Header>
          <Toast.Body>{t(authError)}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default Login;
