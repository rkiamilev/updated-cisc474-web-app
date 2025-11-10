export class CreateUsersDto {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  role?: string;
}