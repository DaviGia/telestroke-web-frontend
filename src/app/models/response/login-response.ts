import { User } from "../user";

export interface LoginResponse {
    user: User;
    token: string;
    refreshToken: string;
}