export type UserRole = "ADMIN" | "PM" | "INV" | "TECH";

export const ROLE_ROUTES: Record<UserRole, string> = {
  ADMIN: "/admin",
  PM: "/pm",
  INV: "/inv",
  TECH: "/tech",
};

export const ROLE_SLUGS: Record<UserRole, string> = {
  ADMIN: "admin",
  PM: "pm",
  INV: "inv",
  TECH: "tech",
};

export function getRoleFromSlug(slug: string): UserRole | null {
  const entry = Object.entries(ROLE_SLUGS).find(([, value]) => value === slug);
  return entry ? (entry[0] as UserRole) : null;
}

export function isRoleAllowed(userRole: UserRole, pathname: string): boolean {
  const baseRoute = ROLE_ROUTES[userRole];
  return pathname === baseRoute || pathname.startsWith(`${baseRoute}/`);
}