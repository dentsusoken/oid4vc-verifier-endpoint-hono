import { Handler } from 'hono';
import { AbstractController } from '../AbstractController';
import { Env } from '../../../../env';
import { GetDI } from '../../../../di';
import {
  initTransactionSchema,
  InitTransactionTO,
} from '@vecrea/oid4vc-verifier-endpoint-core';

export class InitTransactionController<
  T extends Env
> extends AbstractController<T> {
  constructor(private readonly getDI: GetDI<T>) {
    super();
  }
  handler(): Handler {
    return async (c) => {
      const { portsInput, config } = this.getDI(c);
      const initTransaction = portsInput.initTransaction();
      const { success, data, error } = initTransactionSchema.safeParse(
        await c.req.json()
      );

      if (!success) {
        return this.handleError(c, config, error.message);
      }

      const input = InitTransactionTO.fromJSON(data);
      console.info(`Handling InitTransaction nonce=${input.nonce} ... `);

      const result = await initTransaction(input);
      if (result.isFailure()) {
        const error = result.error;
        console.warn('While handling InitTransaction', error);
        return this.handleError(c, config, error);
      }

      const it = result.value!;
      console.info(`Initiated transaction tx ${it.transactionId}`);
      return c.json(it.toJSON());
    };
  }
}
