-- Migración: Sistema de Colaboración (Compartir Tareas y Subtareas)

-- Tabla: task_assignments (para comparticiones de tareas)
CREATE TABLE public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  shared_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shared_to_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(task_id, shared_to_id)
);

-- Tabla: subtask_assignments (para comparticiones de subtareas 1:1)
CREATE TABLE public.subtask_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_id UUID NOT NULL REFERENCES public.subtasks(id) ON DELETE CASCADE,
  shared_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  shared_to_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(subtask_id, shared_to_id)
);

-- Índices para performance
CREATE INDEX idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_shared_by_id ON public.task_assignments(shared_by_id);
CREATE INDEX idx_task_assignments_shared_to_id ON public.task_assignments(shared_to_id);
CREATE INDEX idx_task_assignments_status ON public.task_assignments(status);
CREATE INDEX idx_subtask_assignments_subtask_id ON public.subtask_assignments(subtask_id);
CREATE INDEX idx_subtask_assignments_shared_by_id ON public.subtask_assignments(shared_by_id);
CREATE INDEX idx_subtask_assignments_shared_to_id ON public.subtask_assignments(shared_to_id);
CREATE INDEX idx_subtask_assignments_status ON public.subtask_assignments(status);

-- Habilitar RLS
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtask_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies para task_assignments
-- Política 1: Creator puede ver todas sus comparticiones
CREATE POLICY "Creator can view own task_assignments" ON public.task_assignments
  FOR SELECT USING (auth.uid() = shared_by_id);

-- Política 2: Receptor puede ver sus assignments
CREATE POLICY "Recipient can view task_assignments to them" ON public.task_assignments
  FOR SELECT USING (auth.uid() = shared_to_id);

-- Política 3: Creator puede crear assignments
CREATE POLICY "Creator can create task_assignments" ON public.task_assignments
  FOR INSERT WITH CHECK (
    auth.uid() = shared_by_id AND
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE id = task_id AND creator_id = auth.uid()
    )
  );

-- Política 4: Receptor puede actualizar estado (aceptar/rechazar)
CREATE POLICY "Recipient can accept/reject task_assignments" ON public.task_assignments
  FOR UPDATE USING (auth.uid() = shared_to_id)
  WITH CHECK (auth.uid() = shared_to_id);

-- Política 5: Creator puede actualizar (revocar antes de aceptación)
CREATE POLICY "Creator can update/delete task_assignments" ON public.task_assignments
  FOR UPDATE USING (auth.uid() = shared_by_id);

CREATE POLICY "Creator can delete task_assignments" ON public.task_assignments
  FOR DELETE USING (auth.uid() = shared_by_id);

-- RLS Policies para subtask_assignments
-- Similar structure
CREATE POLICY "Creator can view own subtask_assignments" ON public.subtask_assignments
  FOR SELECT USING (auth.uid() = shared_by_id);

CREATE POLICY "Recipient can view subtask_assignments to them" ON public.subtask_assignments
  FOR SELECT USING (auth.uid() = shared_to_id);

CREATE POLICY "Creator can create subtask_assignments" ON public.subtask_assignments
  FOR INSERT WITH CHECK (
    auth.uid() = shared_by_id AND
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE id = (
        SELECT task_id FROM public.subtasks
        WHERE id = subtask_id
      )
      AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Recipient can accept/reject subtask_assignments" ON public.subtask_assignments
  FOR UPDATE USING (auth.uid() = shared_to_id)
  WITH CHECK (auth.uid() = shared_to_id);

CREATE POLICY "Creator can update/delete subtask_assignments" ON public.subtask_assignments
  FOR UPDATE USING (auth.uid() = shared_by_id);

CREATE POLICY "Creator can delete subtask_assignments" ON public.subtask_assignments
  FOR DELETE USING (auth.uid() = shared_by_id);

-- ACTUALIZAR RLS policies existentes para tasks y subtasks
-- Actualizar task SELECT para incluir aceptadas assignments
DROP POLICY IF EXISTS "Users can view own tasks (created or assigned)" ON public.tasks;
CREATE POLICY "Users can view own tasks (created, assigned, or shared)" ON public.tasks
  FOR SELECT USING (
    auth.uid() = creator_id OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM public.task_assignments
      WHERE task_id = tasks.id
      AND shared_to_id = auth.uid()
      AND status = 'accepted'
    )
  );

-- Actualizar subtask SELECT para incluir aceptadas assignments
DROP POLICY IF EXISTS "Subtasks visible if task is visible" ON public.subtasks;
CREATE POLICY "Subtasks visible if task is visible or assigned" ON public.subtasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE id = task_id AND (
        creator_id = auth.uid() OR
        assigned_to = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.task_assignments
          WHERE task_id = tasks.id
          AND shared_to_id = auth.uid()
          AND status = 'accepted'
        )
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.subtask_assignments
      WHERE subtask_id = subtasks.id
      AND shared_to_id = auth.uid()
      AND status = 'accepted'
    )
  );

-- Actualizar subtask UPDATE para permitir que asignees completen
DROP POLICY IF EXISTS "Task creator can update subtasks" ON public.subtasks;
CREATE POLICY "Task creator and assignees can update subtasks" ON public.subtasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE id = task_id AND creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.subtask_assignments
      WHERE subtask_id = subtasks.id
      AND shared_to_id = auth.uid()
      AND status = 'accepted'
    )
  );

-- Registrar la migración en historial (opcional)
INSERT INTO public.task_history (task_id, action, performed_by, details)
SELECT
  NULL::UUID,
  'migration',
  auth.uid(),
  jsonb_build_object('migration', 'collaboration_system_v1')
WHERE auth.uid() IS NOT NULL;
