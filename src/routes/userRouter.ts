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
 
// Получение списка пользователей (админ)
router.get('/users', accessMiddleware, requireAdmin, userController.getAllUsers);

// Получение пользователя по ID (админ или сам пользователь)
router.get('/:id', accessMiddleware, requireSelfOrAdmin, userController.getUserById);

// Блокировка пользователя (админ или сам пользователь)
router.patch('/:id/block', accessMiddleware, requireSelfOrAdmin, userController.blockUser);
// Разблокировка пользователя (админ)
router.patch('/:id/unblock', accessMiddleware, requireAdmin, userController.unblockUser);

export default router; 