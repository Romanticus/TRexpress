import { Router, Request, Response } from 'express';

const router = Router(); 

// router.get('/users/:id', (req: Request, res: Response) => {
  
//   индекс в массиве - число, поэтому приводим к Number
//   const id = Number(req.params.id);
//   if (!users[id]) {
//     res.send(`Такого пользователя не существует`);
//     return;
//   }

//   const { name, age } = users[id];
  
//   res.send(`Пользователь ${name}, ${age} лет`);
// });

// router.get('/', getUsers);
// router.get('/:id', getUser);
// router.post('/', createUser);
// router.put('/', replaceUser);
// router.patch('/', updateUserInfo);
// router.delete('/', deletUser); 
export default router; 