import AppDataSource from './src/data-source';

async function runMigrations() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');
    
    console.log('Running migrations...');
    await AppDataSource.runMigrations();
    console.log('Migrations have been run successfully!');
    
    await AppDataSource.destroy();
  } catch (err) {
    console.error('Error during migration:', err);
  }
}

runMigrations();
