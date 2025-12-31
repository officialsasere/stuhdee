export function getCourseErrorMessage(error: unknown): string {
  // 1️⃣ Network / fetch / unknown runtime errors
  if (error === null || error === undefined) {
    return 'Something went wrong. Please try again.'
  }

  // 2️⃣ Supabase / API returned structured object
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

    return String((error as { error: string }).error)
  }

  // 3️⃣ Plain string errors
  if (typeof error === 'string') {
    return error
  }

  // 4️⃣ Error-like objects (without instanceof)
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
