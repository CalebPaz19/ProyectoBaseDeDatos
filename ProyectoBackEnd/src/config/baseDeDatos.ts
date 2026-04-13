import sql, { Request, Transaction } from "mssql"

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

  
export const getRequest = async (tx?: Transaction): Promise<Request> => {
if (tx) return tx.request();

const pool = await poolPromise;
return pool.request();
};