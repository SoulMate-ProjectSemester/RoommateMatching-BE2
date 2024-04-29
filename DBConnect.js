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

// 특정 사용자의 assistant_id 불러오기
async function getAssistantId() {
  const connection = await pool.getConnection(); 
  try {
    const [rows] = await connection.query(
      'SELECT assistant_id FROM assistant'
    );
    if (rows.length > 0) {
      return rows[0].assistant_id.toString('hex');  // binary 데이터를 hex string으로 변환
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
async function getThreadId(userId) {
  const connection = await pool.getConnection(); 
  try {
    const [rows] = await connection.query(
      'SELECT thread_id FROM thread WHERE member_id = ?',
      [userId]
    );
    if (rows.length > 0) {
      return rows[0].thread_id;  // binary 데이터를 hex string으로 변환
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
async function saveThreadId(userId, threadId) {
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
        'SELECT member_id FROM thread WHERE member_id = ?',
        [userId]
      );
      if (threadExist.length === 0) {
        // thread_id가 존재하지 않으면 삽입
        const result = await connection.query(
          'INSERT INTO thread(member_id, thread_id, create_date) VALUES(?, ?, CURDATE())',
          [userId, threadId]
        );
        return result;
      } else {
        // thread_id가 이미 존재하면 업데이트
        const result = await connection.query(
          'UPDATE thread SET thread_id = ?, create_date = CURDATE() WHERE member_id = ?',
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


module.exports = { getAssistantId, saveAssistantId, getThreadId, saveThreadId };


/**
 * gpt api 관련 기능
 * 회원만 thread를 생성할 수 있도록 제한 ----------- assistant id 저장하는 부분 에러 
 * assistant, thread 생성을 유저별로 한번씩만 가능하도록 기능 구현
 * 
 * 프런트에서 사용할만한 기능
 * 전체 대화내용 불러와서 리턴하기
 * 
 * 추후 추가될 기능
 * assistant id, thread id, message id, run id가 생성되는데 어떻게 관리할 것인가.
 * thread에 파일 추가할 수 있는데 대화 내용을 파일로 추가할 것인가 아니면 db에서 조회할 것인가.
 * 
 */