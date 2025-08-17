// src/constants/texts.ts
export const Texts = {
  server: {
    success: {
      documentationOn: 'Documentation listening at {address}/docs',
    },
  },

  environment: {
    errors: {
      envValidation: {
        description:
          'One or more environment variables are missing or invalid.',
      },
    },
  },

  swagger: {
    description: 'LEXIS SaaS ERP Back End',
  },

  handleError: {
    errors: {
      validationError: {
        error: 'Response Validation Error',
        message: 'The request does not match the expected schema',
        logMessage: 'Zod Validation Error',
      },
      serializationError: {
        error: 'Internal Server Error',
        message: 'The response does not match the expected schema',
        logMessage: 'Response Serialization Error',
      },
      unexpectedError: {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred.',
        logMessage: 'Unexpected Error',
      },
    },
  },

  rateLimit: {
    approachingLimit: 'Client {ip} is approaching the limit',
    limitExceeded: 'Client {ip} has exceeded the limit',
    banned: 'Client {ip} has been banned due to excessive requests',
    logExceeded: 'Limit exceeded for {ip} - {method}:{url}',
    error: 'Too Many Requests',
    message:
      'You have exceeded the limit of {max} requests per {after}. Please try again later.',
    code: 'LIMIT_EXCEEDED',
    bannedMessage:
      'Your access has been temporarily suspended due to excessive requests.',
    bannedError: 'Access Blocked',
    bannedCode: 'ACCESS_BLOCKED',
  },

  database: {
    connection: {
      success: 'Database connected successfully',
      error: 'Failed to connect to the database',
      disconnect: 'Database disconnected',
    },
    query: {
      error: 'Error executing database query',
    },
    transaction: {
      error: 'Database transaction failed',
    },
  },

  authRoute: {
    register: {
      errors: {
        invalidRequest: 'Invalid request data',
        emailInUse: 'Email already in use',
        internalServerError: 'Internal server error',
      },
      success: {
        created: 'User registered successfully',
      },
    },
    login: {
      errors: {
        invalidRequest: 'Invalid request data',
        invalidCredentials: 'Invalid credentials',
        accountSuspended: 'Account is suspended. Contact support.',
        internalServerError: 'Internal server error',
      },
      success: {
        loggedIn: 'Login successful',
      },
    },
    refresh: {
      errors: {
        invalidRequest: 'Invalid request data',
        invalidRefreshToken: 'Invalid refresh token',
        internalServerError: 'Internal server error',
      },
      success: {
        tokenRefreshed: 'Token refreshed successfully',
      },
    },
  },

  userRoutes: {
    errors: {
      unauthorized: 'Unauthorized',
      missingToken: 'Missing token',
      invalidToken: 'Invalid token',
      expiredToken: 'Token inválido ou expirado',
      forbiddenUpdate: 'You can only update your own account',
      forbiddenDelete: 'You can only delete your own account',
      notFound: 'User not found',
    },
    success: {
      updated: 'User updated successfully',
      deleted: 'User deleted successfully',
    },
  },
} as const
