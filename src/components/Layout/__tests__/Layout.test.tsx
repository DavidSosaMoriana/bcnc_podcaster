import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Layout from '../Layout';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Mock del contexto de tema
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

// Mock del Header component
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Mock Header</header>;
  };
});

// Helper para renderizar Layout con todos los providers necesarios
const renderLayout = (children: React.ReactNode = <div>Test Content</div>) => {
  return render(
    <BrowserRouter>
      <MockThemeProvider>
        <AppProvider>
          <Layout>{children}</Layout>
        </AppProvider>
      </MockThemeProvider>
    </BrowserRouter>
  );
};

describe('Layout', () => {
  it('should render with header and main content', () => {
    renderLayout(<div>Test Content</div>);

    const header = screen.getByTestId('header');
    const main = screen.getByRole('main');
    const content = screen.getByText('Test Content');

    expect(header).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('should have proper layout structure', () => {
    const { container } = renderLayout();

    const layout = container.querySelector('.layout');
    const main = container.querySelector('.layout__main');
    const layoutContainer = container.querySelector('.layout__container');

    expect(layout).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(layoutContainer).toBeInTheDocument();
  });

  it('should render children inside layout container', () => {
    const testChild = (
      <div data-testid="test-child">Custom Child Component</div>
    );
    renderLayout(testChild);

    const child = screen.getByTestId('test-child');
    const layoutContainer = child.closest('.layout__container');

    expect(child).toBeInTheDocument();
    expect(layoutContainer).toContainElement(child);
  });

  it('should have main element with proper role', () => {
    renderLayout();

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('layout__main');
  });

  it('should render multiple children correctly', () => {
    const multipleChildren = (
      <>
        <div data-testid="child-1">First Child</div>
        <div data-testid="child-2">Second Child</div>
        <span data-testid="child-3">Third Child</span>
      </>
    );

    renderLayout(multipleChildren);

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });
});
