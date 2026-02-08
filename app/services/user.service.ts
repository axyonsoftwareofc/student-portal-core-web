import { api } from "./api";
import { UserRequest } from "./dtos/user-request.dto";
import { UserResponse } from "./dtos/user-response.dto";

export const registerUser = async (
  data: UserRequest
): Promise<UserResponse> => {
  const response = await api.post<UserResponse>(
    "/users/register",
    data
  );
  return response.data;
};
