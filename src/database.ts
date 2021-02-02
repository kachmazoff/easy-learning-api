import mysql from "mysql";

// const connection = mysql.createConnection({
//     host: process.env.dbHost,
//     user: process.env.dbUser,
//     password: process.env.dbPassword
// });

// connection.connect();

// connection.query('SHOW DATABASES', function (err, rows, fields) {
//     if (err) throw err;

//     console.log(rows);
// });

// const query = (sql, )

const dbConfig = {
  connectionLimit: 10, // default 10
  host: process.env.dbHost,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  database: process.env.dbName,
};

const pool = mysql.createPool(dbConfig);
const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) reject(err);
      console.log("MySQL pool connected: threadId " + connection.threadId);
      const query = (sql: string | mysql.QueryOptions, binding: any) => {
        return new Promise((resolve, reject) => {
          connection.query(sql, binding, (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
      };
      const release = () => {
        return new Promise((resolve, reject) => {
          if (err) reject(err);
          console.log("MySQL pool released: threadId " + connection.threadId);
          resolve(connection.release());
        });
      };
      resolve({ query, release });
    });
  });
};

const query = <T extends unknown>(
  sql: string | mysql.QueryOptions,
  binding?: any
): Promise<T | undefined> => {
  return new Promise<T | undefined>((resolve, reject) => {
    pool.query(sql, binding, (err, result: T, fields) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

export { pool, connection, query };
// export { connection }
