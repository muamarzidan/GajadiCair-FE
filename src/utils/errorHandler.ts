/**
 * Extracts error message from API error response
 * Supports multiple error response structures:
 * 
 * Structure 1 (Root message):
 * {
 *   "statusCode": 400,
 *   "message": "Invalid credentials",
 *   "data": null
 * }
 * 
 * Structure 2 (Errors object):
 * {
 *   "statusCode": 400,
 *   "message": "Validation failed",
 *   "errors": {
 *     "name": "VALIDATION_ERROR",
 *     "message": "Email is required",
 *     "validationErrors": {...}
 *   }
 * }
 * 
 * @param error - Error object from try-catch block
 * @param fallbackMessage - Default message if no error message found
 * @returns Extracted error message
 */
export const getErrorMessage = (error: any, fallbackMessage: string = 'An error occurred'): string => {
  // Priority order:
  // 1. Response data message (root level)
  // 2. Response data errors.message
  // 3. Error message property
  // 4. Fallback message
  
  const rootMessage = error.response?.data?.message;
  const errorsMessage = error.response?.data?.errors?.message;
  const errorMessage = error.message;
  
  return rootMessage || errorsMessage || errorMessage || fallbackMessage;
};

/**
 * Extracts validation errors from API error response
 * @param error - Error object from try-catch block
 * @returns Validation errors object or null
 */
export const getValidationErrors = (error: any): Record<string, string[]> | null => {
  return error.response?.data?.errors?.validationErrors || null;
};

/**
 * Checks if error is an authentication error (401)
 * @param error - Error object from try-catch block
 * @returns true if 401 error
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401;
};

/**
 * Checks if error is a validation error (400)
 * @param error - Error object from try-catch block
 * @returns true if 400 error
 */
export const isValidationError = (error: any): boolean => {
  return error.response?.status === 400;
};

/**
 * Checks if error is a server error (500+)
 * @param error - Error object from try-catch block
 * @returns true if 500+ error
 */
export const isServerError = (error: any): boolean => {
  return error.response?.status >= 500;
};
