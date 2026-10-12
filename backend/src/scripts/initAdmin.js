import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

async function main() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'Admin@123';
  const email = process.argv[4] || 'admin@mendihealth.org';

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log('Administrator already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role: 'SYSTEM_ADMINISTRATOR',
      isActive: true,
    },
  });

  console.log(`System administrator created: ${user.username}`);
  console.log('Use the password below for your first login. Change it immediately.');
  console.log(`Password: ${password}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
