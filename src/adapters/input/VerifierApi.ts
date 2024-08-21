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
import { HonoConfiguration } from '../../di/HonoConfiguration';
import {
  PortsInputImpl,
  PortsOutImpl,
  InitTransactionTO,
  TransactionId,
  ResponseCode,
  WalletResponseTO,
  QueryResponse,
} from 'oid4vc-verifier-endpoint-core';
import { getDI } from './getDI';

const INIT_TRANSACTION_PATH = '/ui/presentations';
const WALLET_RESPONSE_PATH = '/ui/presentations/:transactionId';
// const EVENTS_RESPONSE_PATH = '/ui/presentations/:transactionId/events';

export class VerifierApi {
  // public route;

  constructor() {
    // private getPresentationEvents: GetPresentationEvents // private getWalletResponse: GetWalletResponse, // private initTransaction: InitTransaction,
    // this.route = new Hono()
    //   .post(INIT_TRANSACTION_PATH, this.handleInitTransation)
    //   .get(WALLET_RESPONSE_PATH, this.handleGetWalletResponse)
    //   .get(EVENTS_RESPONSE_PATH, this.handleGetPresentationEvents);
  }

  public route = new Hono()
    .post(INIT_TRANSACTION_PATH, this.handleInitTransation())
    .get(WALLET_RESPONSE_PATH, this.handleGetWalletResponse());
  // .get(EVENTS_RESPONSE_PATH, this.handleGetPresentationEvents());

  private handleInitTransation(): Handler {
    return async (c) => {
      const { portsInput } = getDI(c);
      const initTransaction = portsInput.initTransaction();

      const input = InitTransactionTO.deserialize(await c.req.json());
      console.info(`Handling InitTransaction nonce=${input.nonce} ... `);

      const result = await initTransaction(input);
      if (result.isFailure) {
        const error = result.exceptionOrUndefined();
        console.warn('While handling InitTransaction', error);
        return asBadRequest(c, error);
      }
      const it = result.getOrUndefined()!;
      console.info(`Initiated transaction tx ${it.transactionId}`);
      return c.json(it.serialize());
    };
  }

  /**
   * Handles a request placed by verifier, input order to obtain
   * the wallet authorization response
   */
  private handleGetWalletResponse(): Handler {
    return async (c) => {
      const found = (walletResponse: WalletResponseTO) =>
        c.json(walletResponse.serialize(), 200);

      const { portsInput } = getDI(c);
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
        return c.text('', 404);
      }
      if (result.constructor === QueryResponse.InvalidState) {
        return asBadRequest(c);
      }
      if (result.constructor === QueryResponse.Found) {
        return found(result.value);
      }
      return c.text('', 500);
    };
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

// TODO mapOf("error" to this)が実装できてない
const asBadRequest = (c: Context, error?: Error) => c.json(error, 400);
