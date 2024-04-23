const mysql = require('mysql2/promise');

const host = process.env.DBHOST;
const user = process.env.DBUSER; 
const password = process.env.DBPASSWORD;
const database = process.env.DBDATABASE;

const pool = mysql.createPool({ 
  user: user,
  password: password,
  database: database
});

async function getAssistantId(userId) {
  const connection = await pool.getConnection(); 
  try {
    const [rows] = await connection.query('SELECT assistant_id FROM assistant WHERE member_id = ?', [userId]);
    if (rows.length > 0) {
      return rows[0].assistant_id;
    } else {
      return null;
    }
  } finally {
    connection.release();
  }
}

async function saveAssistantId(userId, assistantId) {
  const connection = await pool.getConnection(); 
  try {
    await connection.query('UPDATE assistant SET assistant_id = ? WHERE member_id = ?', [assistantId, userId]);
  } finally {
    connection.release();
  }
}

module.exports = { getAssistantId, saveAssistantId };
