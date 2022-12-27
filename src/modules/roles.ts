
export const hasRole = (roles: number, role: number): boolean => Boolean((roles & role));

export const addRole = (roles: number, role: number): number => roles |= role;

export const removeRole = (roles: number, role: number): number => roles &= ~role;

export const ROLES = {
    MEMBER: 1 << 0,
    MODERATOR: 1 << 1,
    ADMINISTRATOR: 1 << 2
};
