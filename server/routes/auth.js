// server/routes/auth.js
import { Router } from 'express';
import { generateAnonymousName, generateSessionId } from "../services/anonymousNames.js";
import { hashPassword, verifyPassword, generateToken, verifyRealName, getUserByUsername } from '../auth.js';
import { storage } from '../storage.js';
import { pool } from '../db.js';

const router = Router();

router.post('/anonymous', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      const existingUser = await storage.getUserBySessionId(sessionId);
      if (existingUser) return res.json(existingUser);
    }

    const newSessionId = generateSessionId();
    const anonymousName = generateAnonymousName();
    const user = await storage.createUser({ anonymousName, sessionId: newSessionId });
    res.json(user);
  } catch (error) {
    console.error('Anonymous auth error:', error);
    res.status(500).json({ error: 'Failed to create anonymous user' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, realName, email, phone } = req.body;
    if (!username || username.length < 3) return res.status(400).json({ error: '아이디는 3자 이상' });
    if (!password || password.length < 6) return res.status(400).json({ error: '비밀번호는 6자 이상' });
    if (!realName || realName.length < 2) return res.status(400).json({ error: '실명은 2자 이상' });

    const existingUser = await getUserByUsername(username);
    if (existingUser) return res.status(400).json({ error: '이미 존재하는 아이디입니다' });

    const verification = await verifyRealName(realName, phone);
    const hashedPassword = await hashPassword(password);

    const result = await pool.query(`
      INSERT INTO registered_users (username, password, real_name, email, phone, verification_token)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, real_name AS "realName"
    `, [username, hashedPassword, realName, email, phone, verification.verificationCode]);

    const user = result.rows[0];
    if (verification.verified) {
      const token = generateToken(user);
      res.json({ user, token });
    } else {
      res.json({ requiresVerification: true, userId: user.id });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message || '회원가입 실패' });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { username, verificationCode } = req.body;
    const result = await pool.query(`SELECT * FROM registered_users WHERE username = $1`, [username]);
    const user = result.rows[0];

    if (!user || user.verification_token !== verificationCode)
      return res.status(400).json({ error: '인증 코드가 올바르지 않습니다' });

    await pool.query(`UPDATE registered_users SET is_verified = true, verification_token = null WHERE id = $1`, [user.id]);
    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(400).json({ error: '인증 실패' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: '아이디와 비밀번호 필요' });

    const user = await getUserByUsername(username);
    if (!user) return res.status(401).json({ error: '잘못된 아이디 또는 비밀번호' });

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) return res.status(401).json({ error: '잘못된 아이디 또는 비밀번호' });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: '로그인 실패' });
  }
});

export default router;
