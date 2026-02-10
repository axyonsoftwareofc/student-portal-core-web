export interface UserRequest {
  name: string;
  email: string;
  password: string;
  registration?: string;
  role?: string;
}