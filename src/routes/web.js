import homeRouter from './homeRoutes.js';
import userRouter from './userRoutes.js';
import authRouter from './authRoutes.js';
import healthRouter from './healthRoutes.js'

import testRouter from './test.route.js';
const webRoutes = (app) => {
    app.use('/', homeRouter);
    app.use('/api/v1/auth', authRouter);
    app.use('/api/v1/user', userRouter);
    app.use('/api/v1/health', healthRouter);
    app.use('/api/v1/test', testRouter);
}

export default webRoutes;    