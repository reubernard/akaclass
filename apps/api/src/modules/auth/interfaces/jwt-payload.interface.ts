export interface JwtPayload {
  sub: string;
  schoolId: string;
  email: string;
  roles: string[];
}