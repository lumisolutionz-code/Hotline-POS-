export interface Permission {
  _id: string;
  code: string;
  name: string;
  description?: string;
}
export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}
export interface BranchInfo {
  _id: string;
  name: string;
  code: string;
  businessName?: string;
  regNo?: string;
  address?: string | { street?: string; city?: string; province?: string; postalCode?: string };
  phone?: string;
  email?: string;
  isMainBranch?: boolean;
}
export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  roles: Role[];
  permissions: EffectivePermissions;
  currentSession?: {
    id: string;
    branch?: BranchInfo;
    loginTime: string;
    status: string;
  };
}
export interface EffectivePermissions {
  isSuperAdmin: boolean;
  rolePermissions?: string[];
  directAllowed?: string[];
  directDenied?: string[];
  effectivePermissions?: string[];
  permissions?: string; // "ALL" for super admin
}
export interface LoginResponse {
  status: string;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      username: string;
      email?: string;
      isSuperAdmin: boolean;
    };
  };
}
export interface MeResponse {
  status: string;
  data?: {
    user: AuthUser;
  };
}