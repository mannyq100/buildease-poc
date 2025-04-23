/**
 * Mock Auth Service
 * Provides mock implementations of authentication-related services
 */
import authData from '../json/auth.json';

// Types for auth service
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  avatar?: string;
  phone?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface PasswordResetRequest {
  email: string;
}

interface PasswordUpdateData {
  oldPassword: string;
  newPassword: string;
}

/**
 * Simulates a login request
 * @param credentials User login credentials
 * @returns Promise that resolves to an auth response with user and token
 */
export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  // In a real implementation, this would validate credentials with an API
  // For our mock, we just check if the email exists in our mock data
  const user = authData.users.find(u => u.email === credentials.email);
  
  if (!user) {
    return Promise.reject(new Error('Invalid credentials'));
  }
  
  // Map the mock data to match our expected User interface
  const mappedUser: User = {
    id: user.id,
    username: user.email.split('@')[0],
    email: user.email,
    firstName: user.name.split(' ')[0],
    lastName: user.name.split(' ').slice(1).join(' '),
    role: user.role,
    permissions: getPermissionsForRole(user.role),
    avatar: user.avatar,
    phone: '555-123-4567' // Placeholder for mock data
  };
  
  // Create mock tokens
  const token = `mock-token-${user.id}-${Date.now()}`;
  const refreshToken = `mock-refresh-${user.id}-${Date.now()}`;
  
  // Store tokens in localStorage to simulate persistence
  localStorage.setItem('authToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  
  return Promise.resolve({
    user: mappedUser,
    token,
    refreshToken
  });
}

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise that resolves to the registered user
 */
export function register(userData: RegisterUserData): Promise<User> {
  // In a real implementation, this would create a new user on the server
  // For our mock, we just return a new user with a generated ID
  const newUser: User = {
    id: `${authData.users.length + 1}`,
    username: userData.email.split('@')[0],
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: 'member', // Default role for new users
    permissions: getPermissionsForRole('member'),
    phone: userData.phone
  };
  
  return Promise.resolve(newUser);
}

/**
 * Simulates a logout request
 * @returns Promise that resolves when logout is complete
 */
export function logout(): Promise<void> {
  // In a real implementation, this might invalidate the token on the server
  // Remove tokens from localStorage to simulate logging out
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  return Promise.resolve();
}

/**
 * Get the current user
 * @returns Promise that resolves to the current user or null if not authenticated
 */
export function getCurrentUser(): Promise<User | null> {
  // Check if we have a token in localStorage
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return Promise.resolve(null);
  }
  
  // In a real implementation, this would validate the token and return the user
  // For our mock, we just return the admin user from our mock data
  const user = authData.users[0];
  
  // Map the mock data to match our expected User interface
  const mappedUser: User = {
    id: user.id,
    username: user.email.split('@')[0],
    email: user.email,
    firstName: user.name.split(' ')[0],
    lastName: user.name.split(' ').slice(1).join(' '),
    role: user.role,
    permissions: getPermissionsForRole(user.role),
    avatar: user.avatar,
    phone: '555-123-4567' // Placeholder for mock data
  };
  
  return Promise.resolve(mappedUser);
}

/**
 * Request a password reset link
 * @param request Password reset request with email
 * @returns Promise that resolves to success message
 */
export function requestPasswordReset(request: PasswordResetRequest): Promise<{ message: string }> {
  // Check if the email exists
  const userExists = authData.users.some(u => u.email === request.email);
  
  if (!userExists) {
    return Promise.reject(new Error('Email not found'));
  }
  
  return Promise.resolve({ message: 'Password reset link sent to your email' });
}

/**
 * Update user password
 * @param passwordData Old and new password
 * @returns Promise that resolves to success message
 */
export function updatePassword(passwordData: PasswordUpdateData): Promise<{ message: string }> {
  // In a real implementation, this would validate the old password and update to the new one
  return Promise.resolve({ message: 'Password updated successfully' });
}

/**
 * Verify if a user is authenticated (has valid token)
 * @returns Promise that resolves to boolean indicating if user is authenticated
 */
export function isAuthenticated(): Promise<boolean> {
  const token = localStorage.getItem('authToken');
  return Promise.resolve(!!token);
}

/**
 * Refresh the authentication token using the refresh token
 * @returns Promise that resolves to new tokens
 */
export function refreshToken(): Promise<{ token: string; refreshToken: string }> {
  // Check if we have a refresh token
  const existingRefreshToken = localStorage.getItem('refreshToken');
  
  if (!existingRefreshToken) {
    return Promise.reject(new Error('No refresh token available'));
  }
  
  // Create new tokens
  const token = `mock-token-refresh-${Date.now()}`;
  const refreshToken = `mock-refresh-token-${Date.now()}`;
  
  // Store new tokens
  localStorage.setItem('authToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  
  return Promise.resolve({ token, refreshToken });
}

/**
 * Update the current user's profile
 * @param updates Partial user data to update
 * @returns Promise that resolves to the updated user
 */
export function updateProfile(updates: Partial<User>): Promise<User> {
  // In a real implementation, this would update the user on the server
  // For our mock, we just return the admin user with the updates
  const user = authData.users[0];
  
  // Start with the mock user data and apply updates
  const baseUser: User = {
    id: user.id,
    username: user.email.split('@')[0],
    email: user.email,
    firstName: user.name.split(' ')[0],
    lastName: user.name.split(' ').slice(1).join(' '),
    role: user.role,
    permissions: getPermissionsForRole(user.role),
    avatar: user.avatar,
    phone: '555-123-4567' // Placeholder for mock data
  };
  
  const updatedUser = {
    ...baseUser,
    ...updates,
    id: baseUser.id // Ensure ID doesn't change
  };
  
  return Promise.resolve(updatedUser);
}

/**
 * Get available roles for user management
 * @returns Promise that resolves to an array of role names
 */
export function getRoles(): Promise<string[]> {
  return Promise.resolve(['admin', 'manager', 'member', 'viewer']);
}

/**
 * Helper function to get permissions for a given role
 * @param role The user role
 * @returns Array of permission strings
 */
function getPermissionsForRole(role: string): string[] {
  switch(role) {
    case 'admin':
      return [
        'create:project', 'read:project', 'update:project', 'delete:project',
        'create:task', 'read:task', 'update:task', 'delete:task',
        'create:user', 'read:user', 'update:user', 'delete:user',
        'create:material', 'read:material', 'update:material', 'delete:material'
      ];
    case 'manager':
      return [
        'create:project', 'read:project', 'update:project',
        'create:task', 'read:task', 'update:task', 'delete:task',
        'read:user',
        'create:material', 'read:material', 'update:material'
      ];
    case 'member':
      return [
        'read:project',
        'create:task', 'read:task', 'update:task',
        'read:user',
        'read:material'
      ];
    case 'viewer':
    default:
      return [
        'read:project',
        'read:task',
        'read:material'
      ];
  }
}
