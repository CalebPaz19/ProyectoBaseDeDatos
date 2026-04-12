import sql, { Request, Transaction } from "mssql"

const config: sql.config = {
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || '',
  server: process.env.MSSQL_HOST || 'localhost',
  database: process.env.MSSQL_DATABASE || 'AutoDrive',
  port: parseInt(process.env.MSSQL_PORT || '1433', 10),
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
