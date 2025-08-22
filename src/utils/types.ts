

export interface JwtPayload {
    userId: string,
      email: string,
      role:string,
}
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

