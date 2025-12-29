export type SignUpInput = {
  email: string
  password: string
  fullName: string
}

export type SignInInput = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  email: string
  fullName?: string
}