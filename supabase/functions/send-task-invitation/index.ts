import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

interface TaskInvitationPayload {
  recipientEmail: string;
  senderName: string;
  taskTitle: string;
  taskId: string;
  type: "task" | "subtask";
  parentTaskTitle?: string;
}

const sendEmail = async (payload: TaskInvitationPayload) => {
  const {
    recipientEmail,
    senderName,
    taskTitle,
    taskId,
    type,
    parentTaskTitle,
  } = payload;

  const subject =
    type === "subtask"
      ? `${senderName} te compartió una subtarea: ${taskTitle}`
      : `${senderName} te compartió una tarea: ${taskTitle}`;

  const htmlContent =
    type === "subtask"
      ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>¡Tienes una nueva subtarea compartida! 🎯</h1>
      <p>Hola,</p>
      <p><strong>${senderName}</strong> te ha compartido una subtarea en TaskFlow:</p>

      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Tarea:</strong> ${parentTaskTitle}</p>
        <p><strong>Subtarea:</strong> ${taskTitle}</p>
      </div>

      <p>Esta subtarea está pendiente de tu aceptación. Una vez que la aceptes, podrás verla en tu lista de tareas.</p>

      <a href="https://taskflow.app/login" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Inicia sesión en TaskFlow
      </a>

      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Si no tienes una cuenta en TaskFlow, podrás crear una con este mismo email y acceder a la subtarea compartida.
      </p>
    </div>
  `
      : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>¡Tienes una nueva tarea compartida! 📋</h1>
      <p>Hola,</p>
      <p><strong>${senderName}</strong> te ha compartido una tarea en TaskFlow:</p>

      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Tarea:</strong> ${taskTitle}</p>
      </div>

      <p>Esta tarea está pendiente de tu aceptación. Una vez que la aceptes, podrás verla en tu lista de tareas y completarla.</p>

      <a href="https://taskflow.app/login" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Inicia sesión en TaskFlow
      </a>

      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Si no tienes una cuenta en TaskFlow, podrás crear una con este mismo email y acceder a la tarea compartida.
      </p>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TaskFlow <noreply@taskflow.app>",
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const payload: TaskInvitationPayload = await req.json();

    // Validate payload
    if (!payload.recipientEmail || !payload.senderName || !payload.taskTitle) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: recipientEmail, senderName, taskTitle",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await sendEmail(payload);

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
