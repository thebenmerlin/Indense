// Role definitions
export enum Role {
    SITE_ENGINEER = 'SITE_ENGINEER',
    PURCHASE_TEAM = 'PURCHASE_TEAM',
    DIRECTOR = 'DIRECTOR',
}

// Role display names
export const ROLE_NAMES: Record<Role, string> = {
    [Role.SITE_ENGINEER]: 'Site Engineer',
    [Role.PURCHASE_TEAM]: 'Purchase Team',
    [Role.DIRECTOR]: 'Director',
};

// Check if role has global access (all sites)
export function hasGlobalAccess(role: Role): boolean {
    return role === Role.PURCHASE_TEAM || role === Role.DIRECTOR;
}

// Check if role can view pricing
export function canViewPricing(role: Role): boolean {
    return role === Role.PURCHASE_TEAM || role === Role.DIRECTOR;
}

// Check if role can approve indents
export function canApproveIndents(role: Role): boolean {
    return role === Role.PURCHASE_TEAM || role === Role.DIRECTOR;
}
