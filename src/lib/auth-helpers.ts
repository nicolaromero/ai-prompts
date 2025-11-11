import { headers } from 'next/headers';
import { auth } from './auth';

/**
 * Get the current user ID from the session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return session?.user?.id || null;
}

/**
 * Get the active organization ID from the session
 */
export async function getActiveOrganizationId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return session?.session?.activeOrganizationId || null;
}

/**
 * Verify if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return userId !== null;
}

/**
 * Get user session
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return session;
}
