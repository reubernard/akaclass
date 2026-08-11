import {
  PrismaClient,
} from '@prisma/client';


const prisma = new PrismaClient();


async function main() {

  const roles = [
    'ADMIN',
    'TEACHER',
    'PARENT',
  ];


  for (const name of roles) {

    await prisma.role.upsert({

      where:{
        name,
      },

      update:{},

      create:{
        name,
      },

    });

  }


  console.log('Default roles created');

}


main()
  .catch((error)=>{

    console.error(error);

    process.exit(1);

  })
  .finally(async()=>{

    await prisma.$disconnect();

  });