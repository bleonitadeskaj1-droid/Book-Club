// Authentication helper utilities
// Provides functions for checking auth state and requiring authentication for protected actions

/**
 * requireAuth - Wrapper function to protect actions requiring authentication
 * @param {Object} options - Configuration object
 * @param {boolean} isAuthenticated - Current authentication status
 * @param {Function} onLoginRequired - Callback when login is needed
 * @param {Function} onSuccess - Callback to execute after authentication confirmed
 * @returns {void}
 */
export const requireAuth = ({
  isAuthenticated,
  onLoginRequired,
  onSuccess,
}) => {
  if (isAuthenticated) {
    // User is authenticated, execute the action
    if (onSuccess) {
      onSuccess();
    }
  } else {
    // User not authenticated, show login
    if (onLoginRequired) {
      onLoginRequired();
    }
  }
};

/**
 * isUserAuthenticated - Check if user has a valid session
 * @param {Object} session - Supabase auth session
 * @returns {boolean} - True if user is authenticated
 */
export const isUserAuthenticated = (session) => {
  return session && session.user && session.user.id;
};

/**
 * withAuthCheck - Higher-order function to wrap async actions with auth check
 * @param {Object} options - Configuration object
 * @param {boolean} isAuthenticated - Current authentication status
 * @param {Function} action - Async function to execute after auth check
 * @param {Function} onLoginRequired - Callback when login is needed
 * @returns {Promise<any>} - Result of action or null if not authenticated
 */
export const withAuthCheck = async ({
  isAuthenticated,
  action,
  onLoginRequired,
}) => {
  if (!isAuthenticated) {
    if (onLoginRequired) {
      onLoginRequired();
    }
    return null;
  }

  try {
    return await action();
  } catch (error) {
    console.error('Error in authenticated action:', error);
    throw error;
  }
};

/**
 * createAuthAction - Creates a function that checks auth before executing
 * Useful for creating reusable protected action handlers
 * @param {Function} protectedAction - The action to execute after auth check
 * @returns {Function} - A function that accepts options (isAuthenticated, onLoginRequired)
 */
export const createAuthAction = (protectedAction) => {
  return ({ isAuthenticated, onLoginRequired, ...args }) => {
    requireAuth({
      isAuthenticated,
      onLoginRequired,
      onSuccess: () => protectedAction(args),
    });
  };
};

/**
 * getPendingAction - Store and retrieve a pending action for execution after login
 * Useful for continuing an action after user logs in
 * @param {Object} action - Action to store (optional, if null returns stored action)
 * @returns {Object|null} - Stored action or null if no pending action
 */
let pendingAction = null;

export const setPendingAction = (action) => {
  pendingAction = action;
};

export const getPendingAction = () => {
  return pendingAction;
};

export const clearPendingAction = () => {
  pendingAction = null;
};
