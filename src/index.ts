import { Hono } from 'hono';
import { Env } from './env';
import { VerifierApi } from './adapters/input/VerifierApi';

const verifierApi = new VerifierApi({} as any, {} as any);

const app = new Hono<Env>().route('/', verifierApi.route);

export default app;
