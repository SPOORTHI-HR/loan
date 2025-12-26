import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import loanRoutes from './routes/loanRoutes';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
import officerRoutes from './routes/officerRoutes';
app.use('/api/officer', officerRoutes);
import analyticsRoutes from './routes/analyticsRoutes';
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.send('FinTech Lending API is running');
});

export default app;
