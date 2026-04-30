-- Migration: Add email-based sharing support
-- Allows sharing with non-registered users via email
-- When they sign up, assignments auto-link to their account

-- Alter task_assignments to support email-based sharing
ALTER TABLE public.task_assignments
  ADD COLUMN shared_to_email TEXT,
  ALTER COLUMN shared_to_id DROP NOT NULL;

-- Alter subtask_assignments to support email-based sharing
ALTER TABLE public.subtask_assignments
  ADD COLUMN shared_to_email TEXT,
  ALTER COLUMN shared_to_id DROP NOT NULL;

-- Create unique constraint: can't share same task to same email twice
ALTER TABLE public.task_assignments
  DROP CONSTRAINT IF EXISTS task_assignments_task_id_shared_to_id_key,
  ADD CONSTRAINT task_assignments_unique_recipient
    UNIQUE (task_id, COALESCE(shared_to_id, shared_to_email));

ALTER TABLE public.subtask_assignments
  DROP CONSTRAINT IF EXISTS subtask_assignments_subtask_id_shared_to_id_key,
  ADD CONSTRAINT subtask_assignments_unique_recipient
    UNIQUE (subtask_id, COALESCE(shared_to_id, shared_to_email));

-- Update RLS policies to handle email-based recipients
-- For task_assignments: recipient can view and update via email
DROP POLICY IF EXISTS "Recipient can view task_assignments to them" ON public.task_assignments;
CREATE POLICY "Recipient can view task_assignments to them" ON public.task_assignments
  FOR SELECT USING (
    auth.uid() = shared_to_id OR
    auth.jwt() ->> 'email' = shared_to_email
  );

DROP POLICY IF EXISTS "Recipient can accept/reject task_assignments" ON public.task_assignments;
CREATE POLICY "Recipient can accept/reject task_assignments" ON public.task_assignments
  FOR UPDATE USING (
    auth.uid() = shared_to_id OR
    auth.jwt() ->> 'email' = shared_to_email
  )
  WITH CHECK (
    auth.uid() = shared_to_id OR
    auth.jwt() ->> 'email' = shared_to_email
  );

-- For subtask_assignments: recipient can view and update via email
DROP POLICY IF EXISTS "Recipient can view subtask_assignments to them" ON public.subtask_assignments;
CREATE POLICY "Recipient can view subtask_assignments to them" ON public.subtask_assignments
  FOR SELECT USING (
    auth.uid() = shared_to_id OR
    auth.jwt() ->> 'email' = shared_to_email
  );

DROP POLICY IF EXISTS "Recipient can accept/reject subtask_assignments" ON public.subtask_assignments;
CREATE POLICY "Recipient can accept/reject subtask_assignments" ON public.subtask_assignments
  FOR UPDATE USING (
    auth.uid() = shared_to_id OR
    auth.jwt() ->> 'email' = shared_to_email
  )
  WITH CHECK (
    auth.uid() = shared_to_id OR
    auth.jwt() ->> 'email' = shared_to_email
  );

-- Create a function to auto-link assignments when a user signs up
-- This runs after user creation
CREATE OR REPLACE FUNCTION public.link_pending_assignments_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Link task_assignments by email to the new user
  UPDATE public.task_assignments
  SET shared_to_id = NEW.id
  WHERE shared_to_email = NEW.email AND shared_to_id IS NULL;

  -- Link subtask_assignments by email to the new user
  UPDATE public.subtask_assignments
  SET shared_to_id = NEW.id
  WHERE shared_to_email = NEW.email AND shared_to_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on users table to auto-link assignments
DROP TRIGGER IF EXISTS on_user_signup_link_assignments ON public.users;
CREATE TRIGGER on_user_signup_link_assignments
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_pending_assignments_on_signup();

-- Update main tasks RLS policy to include email-based assignments
DROP POLICY IF EXISTS "Users can view own tasks (created, assigned, or shared)" ON public.tasks;
CREATE POLICY "Users can view own tasks (created, assigned, or shared)" ON public.tasks
  FOR SELECT USING (
    auth.uid() = creator_id OR
    auth.uid() = assigned_to OR
    EXISTS (
      SELECT 1 FROM public.task_assignments
      WHERE task_id = tasks.id
      AND (
        shared_to_id = auth.uid() OR
        shared_to_email = auth.jwt() ->> 'email'
      )
      AND status = 'accepted'
    )
  );

-- Update subtasks RLS policy to include email-based assignments
DROP POLICY IF EXISTS "Subtasks visible if task is visible or assigned" ON public.subtasks;
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
          AND (
            shared_to_id = auth.uid() OR
            shared_to_email = auth.jwt() ->> 'email'
          )
          AND status = 'accepted'
        )
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.subtask_assignments
      WHERE subtask_id = subtasks.id
      AND (
        shared_to_id = auth.uid() OR
        shared_to_email = auth.jwt() ->> 'email'
      )
      AND status = 'accepted'
    )
  );

-- Update subtasks UPDATE policy to allow email-based recipients
DROP POLICY IF EXISTS "Task creator and assignees can update subtasks" ON public.subtasks;
CREATE POLICY "Task creator and assignees can update subtasks" ON public.subtasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE id = task_id AND creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.subtask_assignments
      WHERE subtask_id = subtasks.id
      AND (
        shared_to_id = auth.uid() OR
        shared_to_email = auth.jwt() ->> 'email'
      )
      AND status = 'accepted'
    )
  );
