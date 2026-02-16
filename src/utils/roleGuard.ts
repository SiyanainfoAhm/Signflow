export type FormRole = 'student' | 'trainer' | 'office';

export function isRoleVisible(
  roleVisibility: Record<string, boolean> | null | undefined,
  role: FormRole
): boolean {
  if (!roleVisibility || typeof roleVisibility !== 'object') return true;
  const val = roleVisibility[role];
  return val === true || val === undefined;
}

export function isRoleEditable(
  roleEditability: Record<string, boolean> | null | undefined,
  role: FormRole
): boolean {
  if (!roleEditability || typeof roleEditability !== 'object') return true;
  const val = roleEditability[role];
  return val === true || val === undefined;
}
