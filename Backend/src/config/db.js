const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 20,
});

connection.beginTransaction = (callback) => {
  return new Promise((resolve, reject) => {
    connection.getConnection((err, conn) => {
      if (err) {
        if (callback) return callback(err);
        return reject(err);
      }
      
      conn.beginTransaction(err => {
        if (err) {
          conn.release();
          if (callback) return callback(err);
          return reject(err);
        }
        
        const transaction = {
          commit: (cb) => {
            conn.commit(err => {
              conn.release();
              if (cb) cb(err);
            });
          },
          rollback: (cb) => {
            conn.rollback(err => {
              conn.release();
              if (cb) cb(err);
            });
          },
          query: (sql, params, cb) => {
            if (typeof params === 'function') {
              cb = params;
              params = [];
            }
            conn.query(sql, params, cb);
          }
        };
        
        if (callback) {
          callback(null, transaction);
        } else {
          resolve(transaction);
        }
      });
    });
  });
};

// Add promise wrapper
connection.promise = () => ({
  execute: (...args) => new Promise((resolve, reject) => {
    connection.execute(...args, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  }),
  query: (...args) => new Promise((resolve, reject) => {
    connection.query(...args, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  }),
  getConnection: () => new Promise((resolve, reject) => {
    connection.getConnection((err, conn) => {
      if (err) return reject(err);
      resolve({
        ...conn,
        execute: (...args) => new Promise((resolve, reject) => {
          conn.execute(...args, (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        }),
        query: (...args) => new Promise((resolve, reject) => {
          conn.query(...args, (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        }),
        release: () => new Promise((resolve) => {
          conn.release();
          resolve();
        })
      });
    });
  }),
  beginTransaction: () => new Promise((resolve, reject) => {
    connection.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.beginTransaction(err => {
        if (err) {
          conn.release();
          return reject(err);
        }
        resolve({
          commit: () => new Promise((res, rej) => {
            conn.commit(err => {
              if (err) return rej(err);
              conn.release();
              res();
            });
          }),
          rollback: () => new Promise((res, rej) => {
            conn.rollback(err => {
              if (err) return rej(err);
              conn.release();
              res();
            });
          }),
          query: (sql, params) => new Promise((res, rej) => {
            conn.query(sql, params, (err, results) => {
              if (err) return rej(err);
              res(results);
            });
          })
        });
      });
    });
  })
});

// Test connection (callback style)
connection.getConnection((err, conn) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Connected to MySQL database");
    conn.release();
  }
});

module.exports = connection;
