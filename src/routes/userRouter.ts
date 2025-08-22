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

// Получение пользователя по ID (админ или сам пользователь)
router.get('/:id', accessMiddleware, requireSelfOrAdmin, userController.getUserById);

// Получение списка пользователей (только для админа)
router.get('/', accessMiddleware, requireAdmin, userController.getAllUsers);


// Блокировка пользователя (админ или сам пользователь)
router.patch('/users/:id/block', accessMiddleware, requireSelfOrAdmin, userController.blockUser);

// Дополнительно: разблокировка пользователя (только админ)
// router.patch('/users/:id/unblock', accessMiddleware, requireAdmin, userController.unblockUser);

export default router; 