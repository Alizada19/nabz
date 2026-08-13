import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: AuthenticatedUser): Promise<{
        message: string;
        data: import("./interfaces/safe-user.interface").SafeUser;
    }>;
    updateMe(user: AuthenticatedUser, dto: UpdateUserDto): Promise<{
        message: string;
        data: import("./interfaces/safe-user.interface").SafeUser;
    }>;
}
