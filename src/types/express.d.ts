import { UserRole } from "../interfaces/IUser";

export interface AuthUserPayload {
    id: string;
    email: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUserPayload;
        }
    }
}
