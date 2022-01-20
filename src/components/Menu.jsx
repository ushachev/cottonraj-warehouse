import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Menu = ({ className }) => {
  const { t } = useTranslation();

  return (
    <nav className={className}>
      <ul className="mt-3 list-unstyled">
        <li>
          <span>{t('menu.goods')}</span>
          <ul>
            <li>
              <NavLink to="products">{t('menu.catalog')}</NavLink>
            </li>
          </ul>
        </li>
        <li>
          <span>{t('menu.purchase')}</span>
          <ul>
            <li>
              <NavLink to="purchases">{t('menu.invoices')}</NavLink>
            </li>
            <li>
              <NavLink to="purchases/upload">{t('menu.upload')}</NavLink>
            </li>
          </ul>
        </li>
        <li>
          <span>{t('menu.suppliers')}</span>
          <ul>
            <li>
              <NavLink to="suppliers">{t('menu.list')}</NavLink>
            </li>
            <li>
              <NavLink to="suppliers/new">{t('menu.new')}</NavLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
