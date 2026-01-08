export interface CreateShareableLinkDto {
  cityId: string;
  departmentId: string;
  scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE';
  assignmentId?: string;
  incidentId: string;
}

export interface ShareableLinkDto {
  jwt: string;
  expiresAt: string;
}

export interface ValidateShareableLinkDto {
  cityId: string;
  departmentId: string;
  scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE';
  assignmentId?: string;
  expiresAt: string;
}

export interface DeptTrackingLinkDto {
  jwt: string;
  scope: 'ASSIGNMENT_ONLY' | 'DEPT_ACTIVE';
  assignmentId?: string;
  expiresAt: string;
}