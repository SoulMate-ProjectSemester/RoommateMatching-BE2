const mysql = require('mysql2/promise');

const host = process.env.DBHOST;
const user = process.env.DBUSER; 
const password = process.env.DBPASSWORD;
const database = process.env.DBDATABASE;

const pool = mysql.createPool({ 
  host: host,
  user: user,
  password: password,
  database: database
});

// assistant_id 불러오기
async function getAssistantId() {
  const connection = await pool.getConnection(); 
  try {
    const [rows] = await connection.query(
      'SELECT DISTINCT assistant_id FROM assistant'
    );
    if (rows.length > 0) {
      return rows[0].assistant_id;
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

// 사용자의 assistant_id 저장
async function saveAssistantId(assistantId) {
  const connection = await pool.getConnection(); 
  try {
    const result = await connection.query(
      'INSERT INTO assistant(id, assistant_id) VALUES(1, ?)',  
      [assistantId] 
    );
    return result;
  } catch (err) {
    console.error('Database Error:', err);
    throw err;
  } finally {
    connection.release();
  }
}

// 특정 사용자의 thread_id 불러오기
async function getUserThreadId(userId) {
  const connection = await pool.getConnection(); 
  try {
    const [rows] = await connection.query(
      'SELECT thread_id FROM user_thread WHERE member_id = ?',
      [userId]
    );
    if (rows.length > 0) {
      return rows[0].thread_id; 
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

// 사용자의 thread_id 저장
async function saveUserThreadId(userId, threadId) {
  const connection = await pool.getConnection(); 
  try {
    // 먼저 해당 member_id가 있는지 확인
    const [exist] = await connection.query(
      'SELECT id FROM member WHERE id = ?',
      [userId]
    );
    if (exist.length > 0) {
      // member_id가 이미 존재하는 경우에는 thread_id를 삽입 또는 업데이트
      const [threadExist] = await connection.query(
        'SELECT member_id FROM user_thread WHERE member_id = ?',
        [userId]
      );
      if (threadExist.length === 0) {
        // thread_id가 존재하지 않으면 삽입
        const result = await connection.query(
          'INSERT INTO user_thread(member_id, thread_id, create_date) VALUES(?, ?, CURDATE())',
          [userId, threadId]
        );
        return result;
      } else {
        // thread_id가 이미 존재하면 업데이트
        const result = await connection.query(
          'UPDATE user_thread SET thread_id = ?, create_date = CURDATE() WHERE member_id = ?',
          [threadId, userId]
        );
        return result;
      }
    } else {
      throw new Error("No such member exists");
    }
  } catch (err) {
    console.error('Database Error:', err);
    throw err;
  } finally {
    connection.release();
  }
}

// 특정 사용자의 thread_id 불러오기
async function getRoomThreadId(roomId) {
  const connection = await pool.getConnection(); 
  try {
    const [rows] = await connection.query(
      'SELECT thread_id FROM room_thread WHERE chatroom_id = UNHEX(?)',
      [roomId]
    );
    console.log(rows);
    if (rows.length > 0) {
      return rows[0].thread_id; 
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

// 사용자의 thread_id 저장
async function saveRoomThreadId(roomId, threadId) {
  const connection = await pool.getConnection(); 
  try {
    // 먼저 해당 room_id가 있는지 확인
    // UUID를 바이너리로 변환할 때는 하이픈이 제거된 순수 16진수 문자열이 필요
    const [exist] = await connection.query(
      'SELECT room_id FROM chat_room WHERE room_id = UNHEX(REPLACE(?, \'-\', \'\'))',
      [roomId]
    );
    if (exist.length > 0) {
      // room_id가 이미 존재하는 경우에는 thread_id를 삽입 또는 업데이트
      const [threadExist] = await connection.query(
        'SELECT chatroom_id FROM room_thread WHERE chatroom_id = UNHEX(REPLACE(?, \'-\', \'\'))',
        [roomId]
      );
      if (threadExist.length === 0) {
        // thread_id가 존재하지 않으면 삽입
        const result = await connection.query(
          'INSERT INTO room_thread(chatroom_id, thread_id, create_date) VALUES(UNHEX(REPLACE(?, \'-\', \'\')), ?, CURDATE())',
          [roomId, threadId]
        );
        return result;
      } else {
        // thread_id가 이미 존재하면 업데이트
        const result = await connection.query(
          'UPDATE room_thread SET thread_id = ?, create_date = CURDATE() WHERE chatroom_id = UNHEX(REPLACE(?, \'-\', \'\'))',
          [threadId, roomId]
        );
        return result;
      }
    } else {
      throw new Error("No such room exists");
    }
  } catch (err) {
    console.error('Database Error:', err);
    throw err;
  } finally {
    connection.release();
  }
}


module.exports = { getAssistantId, saveAssistantId, getUserThreadId, saveUserThreadId, getRoomThreadId, saveRoomThreadId };
