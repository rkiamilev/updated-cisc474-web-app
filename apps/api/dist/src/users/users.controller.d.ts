import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    }>;
}
//# sourceMappingURL=users.controller.d.ts.map