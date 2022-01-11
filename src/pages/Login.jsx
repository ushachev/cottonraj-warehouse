import React, { useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import {
  Container, Row, Col, Form, FloatingLabel, Button,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

const Login = () => {
  const usernameRef = useRef();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    initialErrors: { username: null },
    onSubmit: async ({ username, password }) => {
      console.dir({ username, password });
    },
    validationSchema: yup.object().shape({
      username: yup.string().trim().required(),
      password: yup.string().trim().required(),
    }),
  });

  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  return (
    <Container fluid className="h-100">
      <div className="d-flex flex-column justify-content-center h-100">
        <Row className="justify-content-center mb-5">
          <Col sm={10} md={8} lg={6} xl={5} xxl={4}>
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
      </div>
    </Container>
  );
};

export default Login;
