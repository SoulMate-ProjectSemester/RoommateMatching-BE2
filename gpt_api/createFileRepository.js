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

async function findChatList(userId){
  const connection = await pool.getConnection(); 
  try {
    const [rows] = await connection.query(
      'SELECT cm. * FROM chat_message cm JOIN chat_room_member crm ON cm.chat_room_id = crm.chat_room_id WHERE crm.member_id = ? AND cm.timestamp >= NOW() - INTERVAL 7 DAY;'
      , [userId]
    );
    if (rows.length > 0) {
      return rows;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Database Error:', err);
    throw err;  // 에러 발생 시 상위 스택으로 전파
  } finally {
    connection.release();
  }
}

async function findKeywordList(userId){
  const connection = await pool.getConnection(); 
  try {
    const [rows] = await connection.query(
      'SELECT * from keyword_keyword_set where keyword_id = ?;'
      , [userId]
    );
    console.log(rows);
    if (rows.length > 0) {
      return rows;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Database Error:', err);
    throw err;  // 에러 발생 시 상위 스택으로 전파
  } finally {
    connection.release();
  }
}

module.exports = { findChatList, findKeywordList };
