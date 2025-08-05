import { Handler } from 'hono';
import { AbstractController } from '../AbstractController';
import { Env } from '../../../../env';
import { GetDI } from '../../../../di';
import {
  QueryResponse,
  RequestId,
  Jwt,
} from '@vecrea/oid4vc-verifier-endpoint-core';

export class GetRequestObjectController<
  T extends Env
> extends AbstractController<T> {
  constructor(private readonly getDI: GetDI<T>) {
    super();
  }
  handler(): Handler {
    return async (c) => {
      const requestObjectFound = (jwt: string) =>
        c.newResponse(jwt, 200, {
          'Content-Type': 'application/oauth-authz-req+jwt',
        });

      const { portsInput, config } = this.getDI(c);
      const getRequestObject = portsInput.getRequestObject();
      const requestId = new RequestId(c.req.param('requestId'));

      console.info(`Handling GetRequestObject for ${requestId.value} ...`);

      const result = await getRequestObject(requestId);
      if (result.constructor === QueryResponse.Found) {
        return requestObjectFound((result as QueryResponse.Found<Jwt>).value);
      }
      if (result.constructor === QueryResponse.NotFound) {
        return this.handleError(c, config, result.message, 404);
      }
      if (result.constructor === QueryResponse.InvalidState) {
        return this.handleError(c, config, result.message, 400);
      }
    };
  }
}
