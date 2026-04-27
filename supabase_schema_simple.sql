-- TaskFlow Database Schema
-- Ejecutar en: Supabase Dashboard → SQL Editor

-- 1. Tablas base (sin RLS aún)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'low' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assignment_status TEXT CHECK (assignment_status IN ('waiting', 'accepted', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  "order" INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'assigned', 'accepted', 'rejected', 'completed', 'modified')),
  performed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Índices para performance
CREATE INDEX idx_tasks_creator_id ON public.tasks(creator_id);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_subtasks_task_id ON public.subtasks(task_id);
CREATE INDEX idx_task_history_task_id ON public.task_history(task_id);

-- 3. Triggers para auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories visible to owner" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can edit own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Assignees can update assignment status" ON public.tasks
  FOR UPDATE USING (auth.uid() = assigned_to)
  WITH CHECK (assignment_status IN ('accepted', 'rejected'));

CREATE POLICY "Creators can delete tasks" ON public.tasks
  FOR DELETE USING (auth.uid() = creator_id);

-- Subtasks policies
CREATE POLICY "Subtasks visible if task visible" ON public.subtasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (creator_id = auth.uid() OR assigned_to = auth.uid()))
  );

CREATE POLICY "Only task creator can manage subtasks" ON public.subtasks
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND creator_id = auth.uid()));

CREATE POLICY "Task creator can update subtasks" ON public.subtasks
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND creator_id = auth.uid()));

CREATE POLICY "Assignee can mark subtasks complete" ON public.subtasks
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND assigned_to = auth.uid()));

CREATE POLICY "Task creator can delete subtasks" ON public.subtasks
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND creator_id = auth.uid()));

-- Task history policies
CREATE POLICY "Task history visible if task visible" ON public.task_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE id = task_id AND (creator_id = auth.uid() OR assigned_to = auth.uid()))
  );

CREATE POLICY "Can insert task history" ON public.task_history
  FOR INSERT WITH CHECK (auth.uid() = performed_by);
