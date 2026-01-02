// Скрипт для назначения пользователя админом
// Использование: node make-admin.js your-email@gmail.com

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin(email) {
  try {
    // Проверяем подключение
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно');

    // Проверяем существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      console.log(`❌ Пользователь с email "${email}" не найден`);
      console.log('💡 Сначала войдите через Google, чтобы создать аккаунт');
      process.exit(1);
    }

    // Обновляем роль на ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`\n✅ Пользователь успешно назначен админом!`);
    console.log('\nДанные пользователя:');
    console.log('ID:', updatedUser.id);
    console.log('Email:', updatedUser.email);
    console.log('Имя:', updatedUser.name || '(не указано)');
    console.log('Роль:', updatedUser.role);
    console.log('\n🎉 Готово! Теперь вы можете войти и зайти на /admin');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    
    if (error.code === 'P2025') {
      console.log('\n💡 Пользователь не найден. Проверьте email.');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Ошибка подключения к базе данных.');
      console.log('Проверьте DATABASE_URL в .env.local');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Получаем email из аргументов командной строки
const email = process.argv[2];

if (!email) {
  console.error('❌ Укажите email пользователя');
  console.log('\nИспользование:');
  console.log('  node make-admin.js your-email@gmail.com');
  process.exit(1);
}

makeAdmin(email);

