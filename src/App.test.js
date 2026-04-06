import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Simple Chatbot header', () => {
  render(<App />);
  const header = screen.getByText(/Simple Chatbot/i);
  expect(header).toBeInTheDocument();
});
