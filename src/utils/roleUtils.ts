import { Role, RoleScope } from '../types';

export function canViewField(role: Role, roleScope: RoleScope): boolean {
  if (roleScope === 'both') return true;
  if (roleScope === 'office') return role === 'office';
  if (roleScope === 'student') return role === 'student' || role === 'office';
  if (roleScope === 'trainer') return role === 'trainer' || role === 'office';
  return false;
}

export function canEditField(
  role: Role,
  roleScope: RoleScope,
  studentSubmitted: boolean,
  trainerSubmitted: boolean
): boolean {
  // Office can edit office-scoped fields
  if (role === 'office' && roleScope === 'office') return true;
  // Office can view but not edit other fields
  if (role === 'office') return false;
  if (roleScope === 'student' && studentSubmitted) return false;
  if (roleScope === 'trainer' && trainerSubmitted) return false;
  return canViewField(role, roleScope);
}

