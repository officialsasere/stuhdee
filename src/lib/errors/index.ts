export function getCourseErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return 'Something went wrong. Please try again.'
  }

  if (typeof error === 'object' && 'error' in error) {
    const message = String((error as { error: unknown }).error).toLowerCase()
    
    if (message.includes('duplicate')) {
      return 'This course already exists.'
    }
    if (message.includes('not authenticated')) {
      return 'You must be logged in to continue.'
    }
    if (message.includes('permission')) {
      return 'You do not have permission to perform this action.'
    }
    if (message.includes('exam date must be in the future')) {
      return 'Please select a future date for your exam.'
    }
    
    return String((error as { error: string }).error)
  }

  if (typeof error === 'string') {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return 'Unexpected error occurred.'
}

export function getSessionErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return 'Unable to update session. Please try again.'
  }

  if (typeof error === 'object' && 'error' in error) {
    const message = String((error as { error: unknown }).error).toLowerCase()
    
    if (message.includes('not found')) {
      return 'Session not found. It may have been deleted.'
    }
    if (message.includes('already completed')) {
      return 'This session is already marked as complete.'
    }
    if (message.includes('not authenticated')) {
      return 'Please log in to continue.'
    }
    
    return String((error as { error: string }).error)
  }

  if (typeof error === 'string') {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return 'Failed to update session.'
}

export function getAuthErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return 'Authentication failed. Please try again.'
  }

  if (typeof error === 'object' && 'error' in error) {
    const message = String((error as { error: unknown }).error).toLowerCase()
    
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.'
    }
    if (message.includes('email already registered') || message.includes('already exists')) {
      return 'An account with this email already exists.'
    }
    if (message.includes('weak password')) {
      return 'Password must be at least 6 characters long.'
    }
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address.'
    }
    
    return String((error as { error: string }).error)
  }

  if (typeof error === 'string') {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return 'Authentication error occurred.'
}

export function getPaymentErrorMessage(error: unknown): string {
  if (error === null || error === undefined) {
    return 'Payment processing failed. Please try again.'
  }

  if (typeof error === 'object' && 'error' in error) {
    const message = String((error as { error: unknown }).error).toLowerCase()
    
    if (message.includes('card declined')) {
      return 'Your card was declined. Please try a different payment method.'
    }
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds. Please use a different card.'
    }
    if (message.includes('expired')) {
      return 'This card has expired. Please use a different card.'
    }
    
    return String((error as { error: string }).error)
  }

  if (typeof error === 'string') {
    return error
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return (error as { message: string }).message
  }

  return 'Payment failed. Please contact support.'
}