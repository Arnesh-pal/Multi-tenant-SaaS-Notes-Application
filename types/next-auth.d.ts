import 'next-auth';
import 'next-auth/jwt';
import { Role, Plan } from '@prisma/client';

// 1. Augment the built-in session.user type
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            role: Role;
            tenantId: string;
            tenantSlug: string;
            plan: Plan;
        };
    }

    // 2. Augment the built-in user type (used in the authorize callback)
    interface User {
        id: string;
        role: Role;
        tenantId: string;
        tenantSlug: string;
        tenantPlan: Plan;
    }
}

// 3. Augment the JWT type
declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: Role;
        tenantId: string;
        tenantSlug: string;
        tenantPlan: Plan;
    }
}