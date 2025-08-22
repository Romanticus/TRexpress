import {  Router } from 'express';
import { authController } from '../controllers/AuthController';
import accessMiddleware from '../middlewares/accessMiddleware';
import { userController } from '../controllers/UserController';
import { requireSelfOrAdmin, requireAdmin } from '../middlewares/rolesMiddleware';

const router = Router(); 

// Регистрация пользователя
router.post('/auth/register', authController.register);

// Авторизация пользователя
router.post('/auth/login', authController.login);
router.use(accessMiddleware)
// Получение пользователя по ID (админ или сам пользователь)
router.get('/:id', requireSelfOrAdmin, userController.getUserById);

// Получение списка пользователей (только для админа)
router.get('/', requireAdmin, userController.getAllUsers);


// Блокировка пользователя (админ или сам пользователь)
router.patch('/:id/block', requireSelfOrAdmin, userController.blockUser);

// Дополнительно: разблокировка пользователя (только админ)
router.patch('/:id/unblock', accessMiddleware, requireAdmin, userController.unblockUser);

export default router; 