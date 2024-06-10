const mysql = require('mysql2/promise');

const host = process.env.DBHOST;
const user = process.env.DBUSER;
const password = process.env.DBPASSWORD;
const database = process.env.DBDATABASE;
const port = process.env.DBPORT;

const pool = mysql.createPool({
  host: host,
  user: user,
  password: password,
  database: database,
  port: port,
});

const { stringify: uuidStringify } = require('uuid');

async function saveRoomMessage(roomId, Messages) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM room_thread WHERE chatroom_id = UNHEX(REPLACE(?, \'-\', \'\'))',
      [roomId]
    );
    if (rows.length > 0) {
      await connection.query(
        'UPDATE room_thread SET room_message = ? WHERE chatroom_id = UNHEX(REPLACE(?, \'-\', \'\'))',
        [JSON.stringify(Messages), roomId]
      );
      return "success";
    } else {
      console.log("방을 찾을 수 없음")
      return null;
    }
  } catch (err) {
    console.error('Database Error:', err);
    throw err;  // 에러 발생 시 상위 스택으로 전파
  } finally {
    connection.release();
  }
}

async function findRoomMessage(roomId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT chatroom_id, room_message FROM room_thread WHERE chatroom_id = UNHEX(REPLACE(?, \'-\', \'\'))',
      [roomId]
    );
    if (rows.length > 0) {
      const chatroomIdBuffer = rows[0].chatroom_id;
      const chatroomIdUUID = uuidStringify(chatroomIdBuffer);
      rows[0].chatroom_id = chatroomIdUUID;
      return rows[0];
    } else {
      console.log("방을 찾을 수 없음")
      return null;
    }
  } catch (err) {
    console.error('Database Error:', err);
    throw err;  // 에러 발생 시 상위 스택으로 전파
  } finally {
    connection.release();
  }
}

async function saveUserMessage(userId, Messages) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      'SELECT * FROM user_thread WHERE member_id = ?',
      [userId]
    );
    if (rows.length > 0) {
      await connection.query(
        'UPDATE user_thread SET user_message = ? WHERE member_id = ?',
        [JSON.stringify(Messages), userId]
      );
      return "success";
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

async function findUserMessage(userId) {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.query(
      'SELECT member_id, user_message FROM user_thread WHERE member_id = ?',
      [userId]
    );
    if (rows.length > 0) {
      return rows[0];
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

module.exports = { 
  saveRoomMessage, findRoomMessage, 
  saveUserMessage, findUserMessage 
};