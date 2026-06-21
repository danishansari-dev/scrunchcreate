/**
 * Why this file exists:
 * Houses configuration and helper utilities for administrator actions.
 * Separating this check allows us to change the authorization mechanism
 * (e.g. migrating from email allowlist to a database roles table)
 * in a single place without modifying routes or components.
 */

/**
 * Checks if a given user object belongs to an administrator.
 * Why: Restricts page visibility and routes in the client.
 * Tricky logic: Parses Vite env variables into a lowercase list to prevent case mismatch bypasses.
 * @danishansari-dev user - The active user profile object containing email
 * @returns {boolean} True if the user is an authorized administrator
 */
export const isUserAdmin = (user) => {
  if (!user || !user.email) return false;

  // Retrieve allowed admin emails from environment config
  const allowedEmailsRaw = import.meta.env.VITE_ADMIN_EMAILS || '';
  const adminEmails = allowedEmailsRaw
    .split(',')
    .map(email => email.trim().toLowerCase());

  return adminEmails.includes(user.email.toLowerCase());
};
