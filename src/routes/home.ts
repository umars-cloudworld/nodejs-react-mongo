import { Router } from 'express';
import { auth } from '../middlewares';
import { catcher } from '../modules';

const home = Router();

home.get('/', auth, catcher(async (_, res) => {
    res.json({ message: 'hello' });
}));

export {
    home
};
