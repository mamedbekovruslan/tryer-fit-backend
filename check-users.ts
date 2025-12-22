import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'tryerfit',
  entities: [User],
  synchronize: false,
  logging: false,
});

async function checkUserData() {
  try {
    await AppDataSource.initialize();
    console.log('Подключение к базе данных успешно!');
    
    // Получим все записи из таблицы users
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    
    console.log('Найдено пользователей:', users.length);
    console.log('Данные пользователей:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Username: "${user.username}", Email: "${user.email}", FirstName: "${user.first_name}", LastName: "${user.last_name}"`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
  }
}

checkUserData();