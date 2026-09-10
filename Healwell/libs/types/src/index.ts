export type UUID = string

export interface User {
  id: UUID
  email: string
  createdAt: string
}

export interface Customer {
  id: UUID
  userId: UUID
  firstName: string
  lastName: string
  dob?: string
}

export interface Policy {
  id: UUID
  policyNumber: string
  status: string
}
