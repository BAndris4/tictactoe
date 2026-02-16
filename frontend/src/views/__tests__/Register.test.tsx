import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Register from '../Register';
import { authApi } from '../../api/auth';

// Mock auth API
vi.mock('../../api/auth', () => ({
  authApi: {
    checkEmail: vi.fn(),
    checkUsername: vi.fn(),
    register: vi.fn(),
    login: vi.fn(),
    getMe: vi.fn(),
  },
}));

// Mock useNavigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('Register View', () => {
  let navigate: any;

  beforeEach(() => {
    vi.resetAllMocks();
    navigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigate);
    
    (authApi.checkEmail as any).mockResolvedValue({ available: true });
    (authApi.checkUsername as any).mockResolvedValue({ available: true });
    (authApi.register as any).mockResolvedValue({ id: 1, username: 'testuser' });
    (authApi.login as any).mockResolvedValue({ access_token: 'fake-token' });
    (authApi.getMe as any).mockResolvedValue({ id: 1, username: 'testuser' });
  });

  it('renders registration form step 1', () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('validates step 1 required fields', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const nextButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('navigates to step 2 after valid step 1', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'StrongPass1!' } });

    const nextButton = screen.getByRole('button', { name: /continue/i }); // Step 1 to 2
    fireEvent.click(nextButton);

    await waitFor(() => {
        expect(authApi.checkUsername).toHaveBeenCalled();
        expect(authApi.checkEmail).toHaveBeenCalled();
        expect(screen.getByText(/personal details/i)).toBeInTheDocument(); // Step 2 header
    });
  });

  it('validates step 2 required fields', async () => {
     render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Complete Step 1
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'StrongPass1!' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
         expect(screen.getByText(/personal details/i)).toBeInTheDocument();
    });

    // Try to proceed without filling Step 2
    const nextButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please select a country/i)).toBeInTheDocument();
        expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
        expect(screen.getByText(/you must accept the terms/i)).toBeInTheDocument();
    });
  });

    it('completes registration successfully', async () => {
     render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    // Step 1
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'StrongPass1!' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(screen.getByText(/personal details/i)).toBeInTheDocument());

    // Step 2
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
    // Country and Phone might be tricky with custom components, trying by simpler means or accessibility roles
    // Assuming Select components rely on hidden inputs or we can select them
    // For country select:
    // It is a SearchableSelect. We might need to click it and select an option.
    // Or assume it has an input with label "Country"
    
    // Check PersonalStep.tsx implementation of SearchableSelect
    // It uses an input for the search inside the dropdown.
    const countryInput = screen.getByLabelText(/country/i);
    fireEvent.click(countryInput);
    
    // Find search input inside dropdown
    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Hungary' } });
    
    // We need to simulate selecting the option. 
    const hungaryOption = await screen.findByText(/Hungary/i);
    fireEvent.click(hungaryOption); 
    // This depends on SearchableSelect implementation.
    // Let's assume hitting Enter or clicking an option works.
    // If it's a combobox, we might find options.
    
    // For simplified testing of logic, we might mock the components if they are too complex, 
    // BUT we want integration tests.
    // Let's try filling them as text inputs if functionality allows, or skip complex interactions if too hard without seeing Select code.
    // Actually, PersonalStep passes `handleCountryChange`.
    
    // Let's rely on the fact that we can type into the inputs if they are accessible.
    
    // Phone
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+36201234567' } });

    // Gender
    const genderSelect = screen.getByLabelText(/gender/i);
    fireEvent.click(genderSelect);
    // Assuming "Male" is an option
    // fireEvent.click(screen.getByText('Male')); // This might fail if rendered in a portal or differently.
    
    // Terms
    fireEvent.click(screen.getByLabelText(/i accept the/i)); 

    // Triggering validation via state update might be async
    
    // Let's cheat a bit if Select is hard: we mock the usage in a smaller scope or we try to find the actual interactive elements.
    // If SearchableSelect is a custom component, let's see if we can just fire change on the underlying input?
    // It usually has an input.
    
    // If Country selection is mandatory, we MUST select a valid country code.



    // Step 2 -> 3
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => expect(screen.getByText(/Step 3 \/ 3/i)).toBeInTheDocument()); // Step 3

    // Step 3 (Tutorial) - default is selected
    const finishButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(finishButton);

    await waitFor(() => {
        expect(authApi.register).toHaveBeenCalled();
        expect(authApi.login).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith('/tutorial'); // Because playTutorial is true by default
    });
  });
});
