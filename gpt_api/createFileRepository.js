const mysql = require('mysql2/promise');

const host = process.env.DBHOST;
const user = process.env.DBUSER; 
const password = process.env.DBPASSWORD;
const database = process.env.DBDATABASE;
const port = process.env.DBPORT

const pool = mysql.createPool({ 
  host: host,
  user: user,
  password: password,
  database: database,
  port: port,
});

async function findChatList(userId){
  const connection = await pool.getConnection(); 
  try {
    const [rows] = await connection.query(
      'SELECT cm. * FROM chat_message cm JOIN chat_room_member crm ON cm.chat_room_id = crm.chat_room_id WHERE crm.member_id = ? AND cm.timestamp >= NOW() - INTERVAL 7 DAY;'
      , [userId]
    );
    return rows.length > 0 ? rows : null;
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
      'SELECT * from keywords where keyword_id = ?;'
      , [userId]
    );
    console.log(rows);
    return rows.length > 0 ? rows : null;
  } catch (err) {
    console.error('Database Error:', err);
    throw err;  // 에러 발생 시 상위 스택으로 전파
  } finally {
    connection.release();
  }
}

async function findRoomMessages(roomId) {
  const connection = await pool.getConnection(); 
  try {
    roomId = roomId.replace(/-/g, ''); // UUID에서 '-' 제거
    const [rows] = await connection.query(
      'SELECT * from chat_message where chat_room_id = UNHEX(?);'
      , [roomId]
    );
    console.log(rows);
    return rows.length > 0 ? rows : null;
  } catch (err) {
    console.error('Database Error:', err);
    throw err;
  } finally {
    connection.release();
  }
}


module.exports = { findChatList, findKeywordList, findRoomMessages };
