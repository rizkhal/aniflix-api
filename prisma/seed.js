const bcrypt = require("bcryptjs");
const prisma = require("../src/database/client");

async function main() {
  const userPassword = await bcrypt.hash("secret", 10);

  await prisma.provider.createMany({
    data: [{ name: "anoboy" }],
  });

  await prisma.user.create({
    data: {
      username: "demo",
      password: userPassword,
      providerId: 1,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
