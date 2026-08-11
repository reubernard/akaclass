export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;

  user!: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    schoolId: string;
  };
}