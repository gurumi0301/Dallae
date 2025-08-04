// server/routes/index.js
import { Router } from 'express';
import authRoutes from './auth.js';
// import chatRoutes from './chat.js';
// import emotionRoutes from './emotion.js';
// import psychologyRoutes from './psychology.js';

const router = Router();

router.use('/auth', authRoutes);
// router.use('/chat', chatRoutes);
// router.use('/emotions', emotionRoutes);
// router.use('/psychology-tests', psychologyRoutes);

export default router;
