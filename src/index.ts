import { Hono } from 'hono';
import { Env } from './env';
// import { HonoConfiguration } from './di/HonoConfiguration';
// import {
//   PortsInputImpl,
//   PortsOutImpl,
// } from '../../oid4vc-verifier-endpoint-core';
// import { InitTransactionTO } from '../../oid4vc-verifier-endpoint-core/lib/ports/input/InitTransaction.types';
import { VerifierApi } from './adapters/input/VerifierApi';
import { WalletApi } from './adapters/input/WalletApi';

const verifierApi = new VerifierApi({} as any, {} as any);
// const walletApi = new WalletApi(
//   {} as any,
//   {} as any,
//   {} as any,
//   {} as any,
//   {} as any
// );

const app = new Hono<Env>().route('/', verifierApi.route);
// .route('/', walletApi.route);

// app.post('/ui/presentations', async (c) => {
//   const configuration = new HonoConfiguration(c);
//   const portsOut = new PortsOutImpl(configuration);
//   const portsInput = new PortsInputImpl(configuration, portsOut);
//   const initTransaction = portsInput.initTransaction();

//   const params = InitTransactionTO.deserialize(await c.req.json());

//   const result = await initTransaction(params);
//   if (result.isFailure) {
//     return c.text('Failed to initialize transaction', 500);
//   }

//   return c.json(result.getOrUndefined()?.serialize());
// });

export default app;
