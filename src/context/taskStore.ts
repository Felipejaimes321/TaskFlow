import { create } from 'zustand';
import { Task, Subtask, Category, Recurrence, TaskAssignment, SubtaskAssignment, User } from '@/types';
import { supabase } from '@/services/supabase';

// ─── Recurrence helpers ───────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0'); }

function nextDueDate(iso: string, recurrence: 'daily' | 'weekly' | 'monthly'): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (recurrence === 'daily')   date.setDate(date.getDate() + 1);
  if (recurrence === 'weekly')  date.setDate(date.getDate() + 7);
  if (recurrence === 'monthly') date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

interface TaskState {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  error: string | null;

  // Collaboration
  pendingAssignments: (TaskAssignment | SubtaskAssignment)[];

  // Tasks
  fetchTasks: (userId: string) => Promise<void>;
  createTask: (title: string, description: string | null, categoryId: string | null, priority: string, dueDate: string | null, recurrence?: Recurrence) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;

  // Categories
  fetchCategories: (userId: string) => Promise<void>;
  createCategory: (name: string, color: string, icon: string) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

  // Subtasks
  createSubtask: (taskId: string, title: string) => Promise<void>;
  updateSubtask: (subtaskId: string, completed: boolean) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;

  // Collaboration - Sharing
  shareTask: (taskId: string, recipientEmail: string) => Promise<void>;
  shareSubtask: (subtaskId: string, recipientEmail: string) => Promise<void>;
  acceptAssignment: (assignmentId: string, type: 'task' | 'subtask') => Promise<void>;
  rejectAssignment: (assignmentId: string, type: 'task' | 'subtask', reason?: string) => Promise<void>;
  fetchPendingAssignments: (userId: string) => Promise<void>;
  findUserByEmail: (email: string) => Promise<User | null>;
  getTaskAssignments: (taskId: string) => Promise<TaskAssignment[]>;
  getSubtaskAssignment: (subtaskId: string) => Promise<SubtaskAssignment | null>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  loading: false,
  error: null,
  pendingAssignments: [],

  fetchTasks: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (*),
          category:categories (*)
        `)
        .or(`creator_id.eq.${userId},assigned_to.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ tasks: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch tasks error:', error);
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (title, description, categoryId, priority, dueDate, recurrence = null) => {
    set({ loading: true, error: null });
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          creator_id:  authUser.user.id,
          title,
          description,
          category_id: categoryId,
          priority,
          due_date:    dueDate,
          status:      'pending',
          recurrence:  recurrence ?? null,
        }])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({ tasks: [data, ...state.tasks] }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Create task error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (taskId, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? data : t)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Update task error:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId),
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Delete task error:', error);
    } finally {
      set({ loading: false });
    }
  },

  completeTask: async (taskId) => {
    // 1. Mark current task as completed
    await get().updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    // 2. If it's recurring, create the next instance automatically
    const task = get().tasks.find(t => t.id === taskId);
    if (task?.recurrence && task.due_date) {
      const nextDate = nextDueDate(task.due_date, task.recurrence);
      await get().createTask(
        task.title,
        task.description,
        task.category_id,
        task.priority,
        nextDate,
        task.recurrence,
      );
    }
  },

  fetchCategories: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ categories: data || [] });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch categories error:', error);
    } finally {
      set({ loading: false });
    }
  },

  createCategory: async (name, color, icon) => {
    set({ loading: true, error: null });
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            user_id: authUser.user.id,
            name,
            color,
            icon,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        categories: [data, ...state.categories],
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Create category error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteCategory: async (categoryId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      set((state) => ({
        categories: state.categories.filter((c) => c.id !== categoryId),
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Delete category error:', error);
    } finally {
      set({ loading: false });
    }
  },

  createSubtask: async (taskId, title) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('subtasks')
        .insert([{ task_id: taskId, title, completed: false, order: 0 }])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: [...(t.subtasks || []), data] }
            : t
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Create subtask error:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateSubtask: async (subtaskId, completed) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('subtasks')
        .update({ completed })
        .eq('id', subtaskId);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((t) => ({
          ...t,
          subtasks: (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, completed } : s
          ),
        })),
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Update subtask error:', error);
    } finally {
      set({ loading: false });
    }
  },

  deleteSubtask: async (subtaskId) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((t) => ({
          ...t,
          subtasks: (t.subtasks || []).filter((s) => s.id !== subtaskId),
        })),
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Delete subtask error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // ─── Collaboration Functions ──────────────────────────────────────────────────

  findUserByEmail: async (email) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Find user error:', error);
      throw error;
    }
  },

  shareTask: async (taskId, recipientEmail) => {
    set({ loading: true, error: null });
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) throw new Error('No autenticado');

      // Obtener datos de la tarea
      const task = get().tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Tarea no encontrada');

      // Buscar usuario receptor (opcional - puede no existir)
      let recipientId: string | null = null;
      try {
        const recipient = await get().findUserByEmail(recipientEmail);
        if (recipient) recipientId = recipient.id;
      } catch (error) {
        // Usuario no existe, continuar con email-based sharing
      }

      // Crear assignment con email (usuario puede no existir aún)
      const { data, error } = await supabase
        .from('task_assignments')
        .insert([{
          task_id: taskId,
          shared_by_id: authUser.user.id,
          shared_to_id: recipientId,
          shared_to_email: recipientEmail.toLowerCase(),
          status: 'pending',
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Ya compartida con este usuario');
        throw error;
      }

      // Enviar email de invitación
      try {
        const senderName = authUser.user.user_metadata?.full_name || 'Un usuario';
        await supabase.functions.invoke('send-task-invitation', {
          body: {
            recipientEmail: recipientEmail.toLowerCase(),
            senderName,
            taskTitle: task.title,
            taskId,
            type: 'task',
          },
        });
      } catch (emailError) {
        console.warn('Email sending failed (non-blocking):', emailError);
        // No lanzar error - el assignment ya se creó
      }

      // Agregar a tareas para ver cambios en tiempo real
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, shared_with: [...(t.shared_with || []), data] }
            : t
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Share task error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  shareSubtask: async (subtaskId, recipientEmail) => {
    set({ loading: true, error: null });
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) throw new Error('No autenticado');

      // Encontrar subtarea y tarea padre
      let subtask: Subtask | undefined;
      let parentTask: Task | undefined;

      for (const task of get().tasks) {
        const found = task.subtasks?.find(s => s.id === subtaskId);
        if (found) {
          subtask = found;
          parentTask = task;
          break;
        }
      }

      if (!subtask || !parentTask) throw new Error('Subtarea no encontrada');

      // Buscar usuario receptor (opcional - puede no existir)
      let recipientId: string | null = null;
      try {
        const recipient = await get().findUserByEmail(recipientEmail);
        if (recipient) recipientId = recipient.id;
      } catch (error) {
        // Usuario no existe, continuar con email-based sharing
      }

      // Crear assignment con email (usuario puede no existir aún)
      const { data, error } = await supabase
        .from('subtask_assignments')
        .insert([{
          subtask_id: subtaskId,
          shared_by_id: authUser.user.id,
          shared_to_id: recipientId,
          shared_to_email: recipientEmail.toLowerCase(),
          status: 'pending',
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Ya compartida con este usuario');
        throw error;
      }

      // Enviar email de invitación
      try {
        const senderName = authUser.user.user_metadata?.full_name || 'Un usuario';
        await supabase.functions.invoke('send-task-invitation', {
          body: {
            recipientEmail: recipientEmail.toLowerCase(),
            senderName,
            taskTitle: subtask.title,
            parentTaskTitle: parentTask.title,
            taskId: parentTask.id,
            type: 'subtask',
          },
        });
      } catch (emailError) {
        console.warn('Email sending failed (non-blocking):', emailError);
        // No lanzar error - el assignment ya se creó
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error('Share subtask error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  acceptAssignment: async (assignmentId, type) => {
    set({ loading: true, error: null });
    try {
      const table = type === 'task' ? 'task_assignments' : 'subtask_assignments';
      const { error } = await supabase
        .from(table)
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', assignmentId);

      if (error) throw error;

      set((state) => ({
        pendingAssignments: state.pendingAssignments.filter((a) => a.id !== assignmentId),
      }));

      // Refetch tareas para actualizar lista
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        await get().fetchTasks(authUser.user.id);
      }
    } catch (error: any) {
      set({ error: error.message });
      console.error('Accept assignment error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  rejectAssignment: async (assignmentId, type, reason) => {
    set({ loading: true, error: null });
    try {
      const table = type === 'task' ? 'task_assignments' : 'subtask_assignments';
      const { error } = await supabase
        .from(table)
        .update({
          status: 'rejected',
          rejection_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', assignmentId);

      if (error) throw error;

      set((state) => ({
        pendingAssignments: state.pendingAssignments.filter((a) => a.id !== assignmentId),
      }));
    } catch (error: any) {
      set({ error: error.message });
      console.error('Reject assignment error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchPendingAssignments: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const userEmail = authUser.user?.email?.toLowerCase();

      // Fetch task assignments (by userId or email)
      const { data: taskAssignments, error: taskError } = await supabase
        .from('task_assignments')
        .select(`
          *,
          task:tasks (id, title, description, creator_id),
          shared_by:users!task_assignments_shared_by_id_fkey (id, full_name, email)
        `)
        .or(`shared_to_id.eq.${userId},shared_to_email.eq.${userEmail}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Fetch subtask assignments (by userId or email)
      const { data: subtaskAssignments, error: subtaskError } = await supabase
        .from('subtask_assignments')
        .select(`
          *,
          subtask:subtasks (id, title, task_id),
          shared_by:users!subtask_assignments_shared_by_id_fkey (id, full_name, email)
        `)
        .or(`shared_to_id.eq.${userId},shared_to_email.eq.${userEmail}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (taskError) throw taskError;
      if (subtaskError) throw subtaskError;

      const all = [
        ...(taskAssignments || []),
        ...(subtaskAssignments || []),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      set({ pendingAssignments: all });
    } catch (error: any) {
      set({ error: error.message });
      console.error('Fetch pending assignments error:', error);
    } finally {
      set({ loading: false });
    }
  },

  getTaskAssignments: async (taskId) => {
    try {
      const { data, error } = await supabase
        .from('task_assignments')
        .select('*, shared_to:users (id, full_name, email)')
        .eq('task_id', taskId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Get task assignments error:', error);
      return [];
    }
  },

  getSubtaskAssignment: async (subtaskId) => {
    try {
      const { data, error } = await supabase
        .from('subtask_assignments')
        .select('*')
        .eq('subtask_id', subtaskId)
        .eq('status', 'accepted')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error: any) {
      console.error('Get subtask assignment error:', error);
      return null;
    }
  },
}));
