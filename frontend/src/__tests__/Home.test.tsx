import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '../app/page';

describe('HomePage Component', () => {
  it('renders hero headline and AI call to actions', () => {
    render(<HomePage />);

    expect(screen.getByText(/Intelligent Travel Planning/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate AI Itinerary/i)).toBeInTheDocument();
    expect(screen.getByText(/Featured Global Destinations/i)).toBeInTheDocument();
  });
});
