import sql from "mssql"

const config: sql.config = {
  user: 'sa',
  password: 'CalebSQL123!',
  server: 'localhost',
  database: 'AutoDrive',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// export const pool = new sql.ConnectionPool(config);
// export const poolConnect = pool.connect();

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server en Docker');
    return pool;
  })
  .catch(err => {
    console.error('Error de conexión:', err);
    process.exit(1);
  });