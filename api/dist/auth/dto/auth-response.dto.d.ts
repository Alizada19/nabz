export declare class AuthUserDto {
    id: string;
    name: string;
    email: string;
    role: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: AuthUserDto;
}
