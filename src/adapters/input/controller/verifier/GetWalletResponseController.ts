import { Handler } from 'hono';
import { AbstractController } from '../AbstractController';
import { Env } from '../../../../env';
import { GetDI } from '../../../../di';
import {
  QueryResponse,
  ResponseCode,
  TransactionId,
  AuthorizationResponseJSON,
} from '@vecrea/oid4vc-verifier-endpoint-core';

export class GetWalletResponseController<
  T extends Env
> extends AbstractController<T> {
  constructor(private readonly getDI: GetDI<T>) {
    super();
  }
  handler(): Handler {
    return async (c) => {
      const found = (walletResponse: AuthorizationResponseJSON) =>
        c.json(walletResponse, 200);

      const { portsInput, config } = this.getDI(c);
      const getWalletResponse = portsInput.getWalletResponse();

      const responseCodeValue = c.req.query('response_code');
      const transactionId = new TransactionId(c.req.param('transactionId'));
      const responseCode = responseCodeValue
        ? new ResponseCode(responseCodeValue)
        : undefined;

      console.info(
        `Handling GetWalletResponse for tx ${
          transactionId.value
        } and response_code: ${responseCode ? responseCode.value : 'n/a'}. ...`
      );

      const result = await getWalletResponse(transactionId, responseCode);
      if (result.constructor === QueryResponse.NotFound) {
        return this.handleError(c, config, result.message, 404);
      }
      if (result.constructor === QueryResponse.InvalidState) {
        return this.handleError(c, config, result.message, 400);
      }
      if (result.constructor === QueryResponse.Found) {
        return found(result.value);
      }
      return this.handleError(c, config, 'Something went wrong...', 500);
    };
  }
}
