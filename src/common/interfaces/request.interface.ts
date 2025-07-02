export interface RequestWithUUID extends Request {
    UUID_User: string;
    jwtToken: string;
}
