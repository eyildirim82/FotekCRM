import { render, screen } from '@testing-library/react';
import App from './App';

test('renders loading state', () => {
  render(<App />);
  expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
});
