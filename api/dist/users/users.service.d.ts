import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SafeUser } from './interfaces/safe-user.interface';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<SafeUser>;
    update(id: string, dto: UpdateUserDto): Promise<SafeUser>;
    toSafeUser(user: any): SafeUser;
}
