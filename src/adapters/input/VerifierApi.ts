/*
 * Copyright (c) 2023 European Commission
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Hono, Context, Handler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { Env } from '../../env';
import { cors } from 'hono/cors';
import { GetDI } from '../../di';
import {
  InitTransactionController,
  GetWalletResponseController,
} from './controller/verifier';

export class VerifierApi<T extends Env> {
  /**
   * The routes available to the frontend
   */
  public route: Hono;

  constructor(
    initTransactionPath: string,
    getWalletResponsePath: string,
    _: string,
    private readonly getDI: GetDI<T>
  ) {
    this.route = new Hono()
      .use('*', (c, next) => {
        const { config } = getDI(c as unknown as Context<T>);
        if (!config.frontendCorsOrigin()) {
          return cors({ origin: '*' })(c, next);
        }
        let origin:
          | string
          | string[]
          | ((origin: string, c: Context<T>) => string | null | undefined) =
          config.frontendCorsOrigin();
        if (typeof origin === 'string') {
          origin = origin.includes('[') ? JSON.parse(origin) : origin;
        }
        return cors({ origin })(c, next);
      })
      .post(initTransactionPath, this.handleInitTransation())
      .get(getWalletResponsePath, this.handleGetWalletResponse());
  }

  private handleInitTransation(): Handler {
    try {
      const controller = new InitTransactionController(this.getDI);

      console.log('InitTransactionController created successfully');

      return controller.handler();
    } catch (error) {
      console.error('Failed to create InitTransactionController:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      throw new HTTPException(500, {
        message: 'Failed to initialize transaction',
      });
    }
  }

  /**
   * Handles a request placed by verifier, input order to obtain
   * the wallet authorization response
   */
  private handleGetWalletResponse(): Handler {
    try {
      const controller = new GetWalletResponseController(this.getDI);

      console.log('GetWalletResponseController created successfully');

      return controller.handler();
    } catch (error) {
      console.error('Failed to create GetWalletResponseController:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      throw new HTTPException(500, {
        message: 'Failed to get wallet response',
      });
    }
  }

  /**
   * Handles a request placed by verifier, input order to obtain
   * presentation logs
   */
  // private handleGetPresentationEvents(): Handler {
  //   return (c) => {
  //     const found = (events: PresentationEventsTO) => c.json(events, 200);

  //     const transactionId = new TransactionId(c.req.param('transactionId'));
  //     console.info(
  //       `Handling GetPresentationEvents for tx ${transactionId} ...`
  //     );

  //     const result = this.getPresentationEvents.invoke(transactionId);
  //     console.log('result :>> ', result);
  //     if (result.constructor === QueryResponse.NotFound) {
  //       return c.text('', 404);
  //     }
  //     if (result.constructor === QueryResponse.InvalidState) {
  //       return asBadRequest(c);
  //     }
  //     if (result.constructor === QueryResponse.Found) {
  //       return found(
  //         (result as QueryResponse.Found<PresentationEventsTO>).value
  //       );
  //     }
  //     return c.text('', 500);
  //   };
  // }
}
