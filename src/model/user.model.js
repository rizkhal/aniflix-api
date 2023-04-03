const prisma = require("../database/client");

const findUserById = (id) => {
  return prisma.user.findFirst({
    where: { id: id },
  });
};

module.exports = {
  findUserById,
};
