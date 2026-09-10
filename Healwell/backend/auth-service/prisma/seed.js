"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const password = 'P@ssw0rd!';
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await prisma.user.upsert({
        where: { email: 'jane.doe@example.com' },
        update: {},
        create: {
            email: 'jane.doe@example.com',
            passwordHash,
            customers: {
                create: {
                    firstName: 'Jane',
                    lastName: 'Doe'
                }
            }
        },
        include: { customers: true }
    });
    console.log('Seeded user:', { id: user.id, email: user.email });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
