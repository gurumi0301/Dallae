import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

// 비밀번호 해시화
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// 비밀번호 검증
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// JWT 토큰 생성
export function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      realName: user.realName 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// JWT 토큰 검증
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 실명 인증 (간단한 모의 구현)
export async function verifyRealName(realName, phone) {
  // 실제 구현에서는 외부 실명인증 API를 사용
  // 여기서는 간단한 검증만 수행
  if (!realName || realName.length < 2) {
    throw new Error('올바른 실명을 입력해주세요');
  }
  
  if (!phone || phone.length < 10) {
    throw new Error('올바른 전화번호를 입력해주세요');
  }
  
  // 인증 코드 생성 (실제로는 SMS 발송)
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  return {
    verified: true,
    verificationCode
  };
}

// 사용자 조회 (registered_users 테이블 사용)
export async function getUserById(id) {
  const query = `SELECT * FROM registered_users WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

// 사용자명으로 조회 (registered_users 테이블 사용)
export async function getUserByUsername(username) {
  const query = `SELECT * FROM registered_users WHERE username = $1`;
  const result = await pool.query(query, [username]);
  return result.rows[0];
}