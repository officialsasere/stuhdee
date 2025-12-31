import { NextResponse } from 'next/server'



export function getApiErrorResponse(error: unknown) {
  // Known, expected errors thrown intentionally
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof (error as { error: unknown }).error === 'string'
  ) {
    return NextResponse.json(
      { error: (error as { error: string }).error },
      { status: 400 }
    )
  }

  // Error-like objects (no instanceof)
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    return NextResponse.json(
      { error: (error as { message: string }).message },
      { status: 500 }
    )
  }

  // Fallback
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
