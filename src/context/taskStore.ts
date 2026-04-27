import { create } from 'zustand';
import { Task, Subtask, Category } from '@/types';
import { supabase } from '@/services/supabase';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  loading: boolean;
  error: string | null;

  // Tasks
  fetchTasks: (userId: string) => Promise<void>;
  createTask: (title: string, description: string | null, categoryId: string | null, priority: string, dueDate: string | null) => Promise<void>;
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
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  loading: false,
  error: null,

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

  createTask: async (title, description, categoryId, priority, dueDate) => {
    set({ loading: true, error: null });
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (!authUser.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            creator_id: authUser.user.id,
            title,
            description,
            category_id: categoryId,
            priority,
            due_date: dueDate,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        tasks: [data, ...state.tasks],
      }));
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
    await get().updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
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
}));
