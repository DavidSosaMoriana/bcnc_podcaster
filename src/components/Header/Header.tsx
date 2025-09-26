import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { useAppContext } from '@/context/AppContext';
import './Header.css';

/**
 * Componente Header de la aplicación
 * Incluye el título como enlace a home y indicador de carga
 */
const Header: React.FC = () => {
  const { state } = useAppContext();

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__title">
          Podcaster
        </Link>

        <div className="header__actions">
          <ThemeToggle />
          {state.loading && (
            <div className="header__loading">
              <LoadingSpinner size="small" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
