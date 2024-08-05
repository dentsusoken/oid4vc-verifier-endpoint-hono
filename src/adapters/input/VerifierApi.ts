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
import { Hono, Context, TypedResponse, Handler } from 'hono';
import {
  GetPresentationEvents,
  GetWalletResponse,
  InitTransaction,
  InitTransactionTO,
  PresentationEventsTO,
  QueryResponse,
  ResponseCode,
  TransactionId,
  WalletResponseTO,
} from '../../mock/endpoint-core';

const INIT_TRANSACTION_PATH = '/ui/presentations';
const WALLET_RESPONSE_PATH = '/ui/presentations/:transactionId';
const EVENTS_RESPONSE_PATH = '/ui/presentations/:transactionId/events';

export class VerifierApi {
  // public route;

  constructor(
    private initTransaction: InitTransaction,
    private getWalletResponse: GetWalletResponse,
    private getPresentationEvents: GetPresentationEvents
  ) {
    // this.route = new Hono()
    //   .post(INIT_TRANSACTION_PATH, this.handleInitTransation)
    //   .get(WALLET_RESPONSE_PATH, this.handleGetWalletResponse)
    //   .get(EVENTS_RESPONSE_PATH, this.handleGetPresentationEvents);
  }

  public route = new Hono()
    .post(INIT_TRANSACTION_PATH, this.handleInitTransation())
    .get(WALLET_RESPONSE_PATH, this.handleGetWalletResponse())
    .get(EVENTS_RESPONSE_PATH, this.handleGetPresentationEvents());

  private handleInitTransation(): Handler {
    return async (c) => {
      try {
        const input = await c.req.json<InitTransactionTO>();
        console.info(`Handling InitTransaction nonce=${input.nonce} ... `);
        const it = this.initTransaction.invoke(input);

        if (it) {
          console.info(`Initiated transaction tx ${it.transactionId}`);
          return c.json(it, 200);
        } else {
          return asBadRequest(c, it);
        }
      } catch (t) {
        console.warn('While handling InitTransaction', t);
        return asBadRequest(c);
      }
    };
  }

  /**
   * Handles a request placed by verifier, input order to obtain
   * the wallet authorization response
   */
  private handleGetWalletResponse(): Handler {
    return (c) => {
      const found = (walletResponse: WalletResponseTO) =>
        c.json(walletResponse, 200);

      const transactionId = new TransactionId(c.req.param('transactionId'));
      const responseCode = new ResponseCode(c.req.query('response_code'));

      console.info(
        `Handling GetWalletResponse for tx ${
          transactionId.value
        } and response_code: ${
          responseCode?.value ? responseCode?.value : 'n/a'
        }. ...`
      );

      const result = this.getWalletResponse.invoke(transactionId, responseCode);
      console.log('result :>> ', result);
      if (result.constructor === QueryResponse.NotFound) {
        return c.text('', 404);
      }
      if (result.constructor === QueryResponse.InvalidState) {
        return asBadRequest(c);
      }
      if (result.constructor === QueryResponse.Found) {
        return found((result as QueryResponse.Found<WalletResponseTO>).value);
      }
      return c.text('', 500);
    };
  }

  /**
   * Handles a request placed by verifier, input order to obtain
   * presentation logs
   */
  private handleGetPresentationEvents(): Handler {
    return (c) => {
      const found = (events: PresentationEventsTO) => c.json(events, 200);

      const transactionId = new TransactionId(c.req.param('transactionId'));
      console.info(
        `Handling GetPresentationEvents for tx ${transactionId} ...`
      );

      const result = this.getPresentationEvents.invoke(transactionId);
      console.log('result :>> ', result);
      if (result.constructor === QueryResponse.NotFound) {
        return c.text('', 404);
      }
      if (result.constructor === QueryResponse.InvalidState) {
        return asBadRequest(c);
      }
      if (result.constructor === QueryResponse.Found) {
        return found(
          (result as QueryResponse.Found<PresentationEventsTO>).value
        );
      }
      return c.text('', 500);
    };
  }
}

// TODO mapOf("error" to this)が実装できてない
const asBadRequest = (c: Context, error?: Error) => c.json(error, 400);
