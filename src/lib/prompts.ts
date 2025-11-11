import { supabase, type Prompt } from "./supabase";

export type CreatePromptData = Omit<Prompt, "id" | "created_at" | "updated_at">;
export type UpdatePromptData = Partial<CreatePromptData>;

/**
 * Get all prompts for the current user
 */
export async function getPrompts(userId: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching prompts: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single prompt by ID
 */
export async function getPromptById(
  promptId: string,
  userId: string
): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", promptId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    throw new Error(`Error fetching prompt: ${error.message}`);
  }

  return data;
}

/**
 * Create a new prompt
 */
export async function createPrompt(
  promptData: CreatePromptData
): Promise<Prompt> {
  const { data, error } = await supabase
    .from("prompts")
    .insert([promptData])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating prompt: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing prompt
 */
export async function updatePrompt(
  promptId: string,
  userId: string,
  updates: UpdatePromptData
): Promise<Prompt> {
  const { data, error } = await supabase
    .from("prompts")
    .update(updates)
    .eq("id", promptId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating prompt: ${error.message}`);
  }

  return data;
}

/**
 * Delete a prompt
 */
export async function deletePrompt(
  promptId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("prompts")
    .delete()
    .eq("id", promptId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Error deleting prompt: ${error.message}`);
  }
}

/**
 * Generate XML from a prompt
 */
export function generatePromptXML(prompt: Prompt): string {
  let xml = `<prompt>\n`;
  xml += `  <role>${escapeXML(prompt.role)}</role>\n`;
  xml += `  <context>${escapeXML(prompt.context)}</context>\n`;
  xml += `  <security>${escapeXML(prompt.security)}</security>\n`;
  xml += `  <task>${escapeXML(prompt.task)}</task>\n`;

  if (prompt.guidelines) {
    xml += `  <guidelines>${escapeXML(prompt.guidelines)}</guidelines>\n`;
  }

  if (prompt.examples) {
    xml += `  <examples>${escapeXML(prompt.examples)}</examples>\n`;
  }

  if (prompt.language_enabled && prompt.language) {
    xml += `  <language>${escapeXML(prompt.language)}</language>\n`;
  }

  xml += `  <response_format>${escapeXML(prompt.response_format)}</response_format>\n`;
  xml += `</prompt>`;

  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Get prompts count for the current user
 */
export async function getPromptsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("prompts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Error counting prompts: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get prompts created this month
 */
export async function getPromptsThisMonth(userId: string): Promise<number> {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { count, error } = await supabase
    .from("prompts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", firstDayOfMonth.toISOString());

  if (error) {
    throw new Error(`Error counting prompts this month: ${error.message}`);
  }

  return count || 0;
}
