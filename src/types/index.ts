export type Priority         = 'low' | 'medium' | 'high';
export type TaskStatus       = 'pending' | 'completed' | 'rejected';
export type AssignmentStatus = 'waiting' | 'accepted' | 'rejected' | null;
export type UserPlan         = 'free' | 'pro';
export type Recurrence       = 'daily' | 'weekly' | 'monthly' | null;

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  order: number;
  created_at: string;
}

export interface Task {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  priority: Priority;
  due_date: string | null;
  status: TaskStatus;
  recurrence: Recurrence;
  assigned_to: string | null;
  assignment_status: AssignmentStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  subtasks?: Subtask[];
  category?: Category;
  creator?: User;
  assignee?: User;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  action: 'created' | 'assigned' | 'accepted' | 'rejected' | 'completed' | 'modified';
  performed_by: string;
  details: Record<string, any>;
  created_at: string;
}

// Types para Sistema de Colaboración
export type AssignmentStatusType = 'pending' | 'accepted' | 'rejected';

export interface TaskAssignment {
  id: string;
  task_id: string;
  shared_by_id: string;
  shared_to_id: string;
  status: AssignmentStatusType;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones cargadas opcionalmente:
  task?: Task;
  shared_by?: User;
  shared_to?: User;
}

export interface SubtaskAssignment {
  id: string;
  subtask_id: string;
  shared_by_id: string;
  shared_to_id: string;
  status: AssignmentStatusType;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones:
  subtask?: Subtask;
  shared_by?: User;
  shared_to?: User;
}

// Extensiones a tipos existentes
export interface TaskWithAssignments extends Task {
  shared_with?: TaskAssignment[]; // quién recibió esta tarea (si soy creator)
  assignment_from?: TaskAssignment; // si yo la recibí (si soy receptor)
}

export interface SubtaskWithAssignment extends Subtask {
  assignment?: SubtaskAssignment; // si yo la recibí (si soy receptor)
}
