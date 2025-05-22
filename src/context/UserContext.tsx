import type React from 'react';
import { createContext, useState, useContext, useEffect } from 'react';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// Define permissions as constants for consistency
export const PERMISSIONS = {
  // Content Management
  MANAGE_PAGES: 'manage_pages',
  EDIT_PAGES: 'edit_pages',
  PUBLISH_PAGES: 'publish_pages',

  // Media Management
  MANAGE_MEDIA: 'manage_media',
  UPLOAD_MEDIA: 'upload_media',
  DELETE_MEDIA: 'delete_media',

  // Deal Management
  MANAGE_DEALS: 'manage_deals',
  EDIT_DEALS: 'edit_deals',
  PUBLISH_DEALS: 'publish_deals',

  // Store Management
  MANAGE_STORES: 'manage_stores',

  // User Management
  MANAGE_USERS: 'manage_users',
  EDIT_USERS: 'edit_users',

  // Site Settings
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_SEO: 'manage_seo',
  MANAGE_DESIGN: 'manage_design',

  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_ANALYTICS: 'export_analytics',

  // Comments/Chat Moderation
  MODERATE_COMMENTS: 'moderate_comments',

  // API Integrations
  MANAGE_API_INTEGRATIONS: 'manage_api_integrations',
  VIEW_API_INTEGRATIONS: 'view_api_integrations',

  // System
  SYSTEM_SETTINGS: 'system_settings',
  ACCESS_LOGS: 'access_logs'
};

// Define user roles with associated permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author',
  MODERATOR: 'moderator',
  ANALYST: 'analyst',
  SUBSCRIBER: 'subscriber'
};

// Map roles to their permissions
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // Super admin has all permissions
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_PAGES, PERMISSIONS.EDIT_PAGES, PERMISSIONS.PUBLISH_PAGES,
    PERMISSIONS.MANAGE_MEDIA, PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.DELETE_MEDIA,
    PERMISSIONS.MANAGE_DEALS, PERMISSIONS.EDIT_DEALS, PERMISSIONS.PUBLISH_DEALS,
    PERMISSIONS.MANAGE_STORES, PERMISSIONS.MANAGE_USERS, PERMISSIONS.EDIT_USERS,
    PERMISSIONS.MANAGE_SETTINGS, PERMISSIONS.MANAGE_SEO, PERMISSIONS.MANAGE_DESIGN,
    PERMISSIONS.VIEW_ANALYTICS, PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.MODERATE_COMMENTS, PERMISSIONS.MANAGE_API_INTEGRATIONS,
    PERMISSIONS.VIEW_API_INTEGRATIONS
  ],
  [ROLES.EDITOR]: [
    PERMISSIONS.EDIT_PAGES, PERMISSIONS.PUBLISH_PAGES,
    PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.MANAGE_MEDIA,
    PERMISSIONS.EDIT_DEALS, PERMISSIONS.PUBLISH_DEALS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.AUTHOR]: [
    PERMISSIONS.EDIT_PAGES,
    PERMISSIONS.UPLOAD_MEDIA,
    PERMISSIONS.EDIT_DEALS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.MODERATE_COMMENTS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [ROLES.ANALYST]: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS
  ],
  [ROLES.SUBSCRIBER]: []
};

export interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  photoURL: string;
  isAdmin: boolean;
  role: string;
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  status: 'active' | 'inactive' | 'pending' | 'banned';
  preferences: {
    darkMode?: boolean;
    language?: string;
    notifications?: {
      email: boolean;
      push: boolean;
    }
  };
  twoFactorAuth: {
    enabled: boolean;
    secret?: string;
    backupCodes?: string[];
    verifiedOn?: string; // ISO date string
    lastUsed?: string; // ISO date string
    setupComplete: boolean;
  };
}

// Role definition
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  isSystem: boolean;
}

interface UserContextType {
  currentUser: User | null;
  users: User[];
  allUsers: User[]; // All users for admin purposes
  login: (email: string, password: string) => { success: boolean; requiresTwoFactor?: boolean; userId?: string };
  verifyTwoFactorCode: (userId: string, code: string) => boolean;
  logout: () => void;
  register: (email: string, password: string, displayName: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => boolean;
  deleteUser: (id: string) => boolean;
  updateUserPermissions: (id: string, permissions: string[]) => boolean;
  updateUserRole: (id: string, role: string) => boolean;

  // Role management
  allRoles: Role[];
  createRole: (role: Role) => boolean;
  updateRole: (role: Role) => boolean;
  deleteRole: (roleId: string) => boolean;
  PERMISSIONS: typeof PERMISSIONS;

  // Two-factor authentication methods
  setupTwoFactor: (userId: string) => { secret: string; qrCodeUrl: string };
  verifyTwoFactorSetup: (userId: string, code: string) => boolean;
  disableTwoFactor: (userId: string, password: string) => boolean;
  generateBackupCodes: (userId: string) => string[];
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  users: [],
  login: () => ({ success: false }),
  verifyTwoFactorCode: () => false,
  logout: () => {},
  register: () => false,
  hasPermission: () => false,
  hasRole: () => false,
  addUser: () => ({
    id: '',
    email: '',
    password: '',
    displayName: '',
    photoURL: '',
    isAdmin: false,
    role: ROLES.SUBSCRIBER,
    permissions: [],
    createdAt: new Date(),
    status: 'active',
    preferences: {
      email: false,
      push: false
    },
    twoFactorAuth: {
      enabled: false,
      setupComplete: false
    }
  }),
  updateUser: () => false,
  deleteUser: () => false,
  updateUserPermissions: () => false,
  updateUserRole: () => false,

  // Two-factor authentication methods
  setupTwoFactor: () => ({ secret: '', qrCodeUrl: '' }),
  verifyTwoFactorSetup: () => false,
  disableTwoFactor: () => false,
  generateBackupCodes: () => []
});

// Generate a simple unique ID for demo purposes
const generateId = () => Math.random().toString(36).substring(2, 15);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize roles
  const [roles, setRoles] = useState<Role[]>(() => {
    const savedRoles = localStorage.getItem('roles');
    if (savedRoles) {
      return JSON.parse(savedRoles);
    }

    // Default system roles
    return [
      {
        id: 'role_super_admin',
        name: 'Super Administrator',
        permissions: Object.values(PERMISSIONS),
        description: 'Full access to all system features and settings',
        isSystem: true
      },
      {
        id: 'role_admin',
        name: 'Administrator',
        permissions: [
          PERMISSIONS.MANAGE_PAGES, PERMISSIONS.EDIT_PAGES, PERMISSIONS.PUBLISH_PAGES,
          PERMISSIONS.MANAGE_MEDIA, PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.DELETE_MEDIA,
          PERMISSIONS.MANAGE_DEALS, PERMISSIONS.EDIT_DEALS, PERMISSIONS.PUBLISH_DEALS,
          PERMISSIONS.MANAGE_STORES, PERMISSIONS.MANAGE_USERS, PERMISSIONS.EDIT_USERS,
          PERMISSIONS.MANAGE_SETTINGS, PERMISSIONS.MANAGE_SEO, PERMISSIONS.MANAGE_DESIGN,
          PERMISSIONS.VIEW_ANALYTICS, PERMISSIONS.EXPORT_ANALYTICS,
          PERMISSIONS.MODERATE_COMMENTS, PERMISSIONS.MANAGE_API_INTEGRATIONS,
          PERMISSIONS.VIEW_API_INTEGRATIONS
        ],
        description: 'Can manage most aspects of the site, but cannot change system settings',
        isSystem: true
      },
      {
        id: 'role_editor',
        name: 'Editor',
        permissions: [
          PERMISSIONS.EDIT_PAGES, PERMISSIONS.PUBLISH_PAGES,
          PERMISSIONS.UPLOAD_MEDIA, PERMISSIONS.MANAGE_MEDIA,
          PERMISSIONS.EDIT_DEALS, PERMISSIONS.PUBLISH_DEALS,
          PERMISSIONS.VIEW_ANALYTICS
        ],
        description: 'Can create, edit, and publish content',
        isSystem: true
      },
      {
        id: 'role_author',
        name: 'Author',
        permissions: [
          PERMISSIONS.EDIT_PAGES,
          PERMISSIONS.UPLOAD_MEDIA,
          PERMISSIONS.EDIT_DEALS,
          PERMISSIONS.VIEW_ANALYTICS
        ],
        description: 'Can create and edit content, but not publish it',
        isSystem: true
      },
      {
        id: 'role_moderator',
        name: 'Moderator',
        permissions: [
          PERMISSIONS.MODERATE_COMMENTS,
          PERMISSIONS.VIEW_ANALYTICS
        ],
        description: 'Can moderate user comments and discussions',
        isSystem: true
      },
      {
        id: 'role_subscriber',
        name: 'Subscriber',
        permissions: [],
        description: 'Basic user with no administrative privileges',
        isSystem: true
      }
    ];
  });

  // Save roles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('roles', JSON.stringify(roles));
  }, [roles]);

  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      return JSON.parse(savedUsers);
    }

    // Default users for demo
    return [
      {
        id: '1',
        email: 'admin@salesaholicsdeals.com',
        password: 'admin123',
        displayName: 'Admin User',
        isAdmin: true,
        role: ROLES.SUPER_ADMIN,
        permissions: ROLE_PERMISSIONS[ROLES.SUPER_ADMIN],
        photoURL: 'https://ui-avatars.com/api/?name=Admin+User&background=982a4a&color=fff',
        createdAt: new Date('2025-01-01').toISOString(),
        status: 'active',
        preferences: {
          darkMode: false,
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        twoFactorAuth: {
          enabled: false,
          setupComplete: false,
          backupCodes: []
        }
      },
      {
        id: '2',
        email: 'editor@example.com',
        password: 'password',
        displayName: 'Editor User',
        isAdmin: false,
        role: ROLES.EDITOR,
        permissions: ROLE_PERMISSIONS[ROLES.EDITOR],
        photoURL: 'https://ui-avatars.com/api/?name=Editor+User&background=3182ce&color=fff',
        createdAt: new Date('2025-02-01').toISOString(),
        status: 'active',
        preferences: {
          darkMode: true,
          language: 'en',
          notifications: {
            email: true,
            push: false
          }
        },
        twoFactorAuth: {
          enabled: false,
          setupComplete: false,
          backupCodes: []
        }
      },
      {
        id: '3',
        email: 'moderator@example.com',
        password: 'password',
        displayName: 'Moderator User',
        isAdmin: false,
        role: ROLES.MODERATOR,
        permissions: ROLE_PERMISSIONS[ROLES.MODERATOR],
        photoURL: 'https://ui-avatars.com/api/?name=Moderator+User&background=38a169&color=fff',
        createdAt: new Date('2025-03-01').toISOString(),
        status: 'active',
        preferences: {
          darkMode: false,
          language: 'en',
          notifications: {
            email: false,
            push: true
          }
        },
        twoFactorAuth: {
          enabled: false,
          setupComplete: false,
          backupCodes: []
        }
      },
      {
        id: '4',
        email: 'user@example.com',
        password: 'password',
        displayName: 'Regular User',
        isAdmin: false,
        role: ROLES.SUBSCRIBER,
        permissions: ROLE_PERMISSIONS[ROLES.SUBSCRIBER],
        photoURL: 'https://ui-avatars.com/api/?name=Regular+User&background=718096&color=fff',
        createdAt: new Date('2025-04-01').toISOString(),
        status: 'active',
        preferences: {
          darkMode: false,
          language: 'en',
          notifications: {
            email: true,
            push: true
          }
        },
        twoFactorAuth: {
          enabled: false,
          setupComplete: false,
          backupCodes: []
        }
      }
    ];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Save current user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      // If 2FA is enabled, we don't log in yet, but return that 2FA verification is required
      if (user.twoFactorAuth.enabled) {
        return { success: true, requiresTwoFactor: true, userId: user.id };
      }

      // If 2FA is not enabled, proceed with normal login
      const updatedUser = {
        ...user,
        lastLogin: new Date().toISOString()
      };
      setCurrentUser(updatedUser);

      // Update the user in the users array
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      return { success: true };
    }
    return { success: false };
  };

  // Verify a 2FA code during login
  const verifyTwoFactorCode = (userId: string, code: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.twoFactorAuth.enabled || !user.twoFactorAuth.secret) {
      return false;
    }

    try {
      // Check if the provided code matches the expected TOTP code
      const isValid = authenticator.verify({ token: code, secret: user.twoFactorAuth.secret });

      if (isValid) {
        // Login the user
        const updatedUser = {
          ...user,
          lastLogin: new Date().toISOString(),
          twoFactorAuth: {
            ...user.twoFactorAuth,
            lastUsed: new Date().toISOString()
          }
        };

        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        return true;
      }

      // Check if the code is a valid backup code
      const backupCodes = user.twoFactorAuth.backupCodes || [];
      const backupIndex = backupCodes.indexOf(code);

      if (backupIndex !== -1) {
        // Remove the used backup code
        const updatedBackupCodes = [...backupCodes];
        updatedBackupCodes.splice(backupIndex, 1);

        // Login the user
        const updatedUser = {
          ...user,
          lastLogin: new Date().toISOString(),
          twoFactorAuth: {
            ...user.twoFactorAuth,
            backupCodes: updatedBackupCodes,
            lastUsed: new Date().toISOString()
          }
        };

        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (email: string, password: string, displayName: string) => {
    if (users.some(u => u.email === email)) {
      return false; // Email already exists
    }

    const newUser: User = {
      id: generateId(),
      email,
      password,
      displayName,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=718096&color=fff`,
      isAdmin: false,
      role: ROLES.SUBSCRIBER,
      permissions: ROLE_PERMISSIONS[ROLES.SUBSCRIBER],
      createdAt: new Date().toISOString(),
      status: 'active',
      preferences: {
        darkMode: false,
        language: 'en',
        notifications: {
          email: true,
          push: true
        }
      },
      twoFactorAuth: {
        enabled: false,
        setupComplete: false,
        backupCodes: []
      }
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    const updatedUsers = [...users];
    updatedUsers[userIndex] = { ...updatedUsers[userIndex], ...updates };

    setUsers(updatedUsers);

    // If the current user is being updated, update the current user state as well
    if (currentUser && currentUser.id === id) {
      setCurrentUser({ ...currentUser, ...updates });
    }

    return true;
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) return false; // Prevent deleting the last user

    setUsers(users.filter(u => u.id !== id));

    // If the current user is being deleted, log out
    if (currentUser && currentUser.id === id) {
      logout();
    }

    return true;
  };

  const updateUserPermissions = (id: string, permissions: string[]) => {
    return updateUser(id, { permissions });
  };

  const updateUserRole = (id: string, role: string) => {
    // Get the default permissions for the role
    const defaultPermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];

    return updateUser(id, {
      role,
      permissions: defaultPermissions,
      // Super Admin and Admin roles should have isAdmin set to true
      isAdmin: [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role)
    });
  };

  // Setup two-factor authentication for a user
  const setupTwoFactor = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { secret: '', qrCodeUrl: '' };
    }

    // Generate a secret for this user
    const secret = authenticator.generateSecret();

    // Create a QR code URL that the user can scan with their authenticator app
    const serviceName = 'SalesAholicsDeals';
    const otpauth = authenticator.keyuri(user.email, serviceName, secret);

    // Generate QR code as data URL
    let qrCodeUrl = '';
    try {
      qrCodeUrl = QRCode.toDataURL(otpauth);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return { secret: '', qrCodeUrl: '' };
    }

    // Update the user with the new secret (but don't enable 2FA yet - that happens after verification)
    updateUser(userId, {
      twoFactorAuth: {
        ...user.twoFactorAuth,
        secret,
        setupComplete: false,
        enabled: false
      }
    });

    return { secret, qrCodeUrl };
  };

  // Verify the initial 2FA setup
  const verifyTwoFactorSetup = (userId: string, code: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.twoFactorAuth.secret) {
      return false;
    }

    try {
      // Verify that the code is correct for the generated secret
      const isValid = authenticator.verify({ token: code, secret: user.twoFactorAuth.secret });

      if (isValid) {
        // Generate backup codes
        const backupCodes = Array.from({ length: 10 }, () =>
          Math.floor(100000 + Math.random() * 900000).toString()
        );

        // Enable 2FA for this user
        updateUser(userId, {
          twoFactorAuth: {
            ...user.twoFactorAuth,
            enabled: true,
            setupComplete: true,
            verifiedOn: new Date().toISOString(),
            backupCodes
          }
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error verifying 2FA setup:', error);
      return false;
    }
  };

  // Disable two-factor authentication
  const disableTwoFactor = (userId: string, password: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || user.password !== password) {
      return false;
    }

    // Disable 2FA
    updateUser(userId, {
      twoFactorAuth: {
        enabled: false,
        setupComplete: false,
        secret: undefined,
        backupCodes: [],
        verifiedOn: undefined,
        lastUsed: undefined
      }
    });

    return true;
  };

  // Generate new backup codes
  const generateBackupCodes = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.twoFactorAuth.enabled) {
      return [];
    }

    // Generate new backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.floor(100000 + Math.random() * 900000).toString()
    );

    // Update the user
    updateUser(userId, {
      twoFactorAuth: {
        ...user.twoFactorAuth,
        backupCodes
      }
    });

    return backupCodes;
  };

  // Role management functions
  const createRole = (role: Role) => {
    // Check if a role with the same name already exists
    if (roles.some(r => r.name === role.name)) {
      return false;
    }

    setRoles([...roles, role]);
    return true;
  };

  const updateRole = (updatedRole: Role) => {
    const roleIndex = roles.findIndex(r => r.id === updatedRole.id);
    if (roleIndex === -1) return false;

    // Don't allow modifying system roles (except permissions)
    if (roles[roleIndex].isSystem) {
      // Only allow updating permissions for system roles
      const newRoles = [...roles];
      newRoles[roleIndex] = {
        ...roles[roleIndex],
        permissions: updatedRole.permissions
      };
      setRoles(newRoles);
    } else {
      // For custom roles, allow updating everything
      const newRoles = [...roles];
      newRoles[roleIndex] = updatedRole;
      setRoles(newRoles);
    }

    // Update all users with this role to have the new permissions
    const usersWithThisRole = users.filter(u =>
      typeof u.role === 'string'
        ? u.role === updatedRole.id
        : false
    );

    if (usersWithThisRole.length > 0) {
      const updatedUsers = users.map(user =>
        user.role === updatedRole.id
          ? { ...user, permissions: updatedRole.permissions }
          : user
      );
      setUsers(updatedUsers);
    }

    return true;
  };

  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || role.isSystem) return false;

    // Check if any users have this role
    const usersWithThisRole = users.filter(u => u.role === roleId);
    if (usersWithThisRole.length > 0) {
      // Reassign users to the Subscriber role
      const subscriberRole = roles.find(r => r.name === 'Subscriber');
      if (subscriberRole) {
        const updatedUsers = users.map(user =>
          user.role === roleId
            ? { ...user, role: subscriberRole.id, permissions: subscriberRole.permissions }
            : user
        );
        setUsers(updatedUsers);
      }
    }

    setRoles(roles.filter(r => r.id !== roleId));
    return true;
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      users,
      allUsers: users, // Provide all users for admin purposes
      login,
      verifyTwoFactorCode,
      logout,
      register,
      hasPermission,
      hasRole,
      addUser,
      updateUser,
      deleteUser,
      updateUserPermissions,
      updateUserRole,

      // Role management
      allRoles: roles,
      createRole,
      updateRole,
      deleteRole,
      PERMISSIONS,

      setupTwoFactor,
      verifyTwoFactorSetup,
      disableTwoFactor,
      generateBackupCodes
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
