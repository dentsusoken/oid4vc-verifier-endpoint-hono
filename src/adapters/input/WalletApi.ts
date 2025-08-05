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
import * as jose from 'jose';
import { Handler, Hono } from 'hono';
import { Env } from '../../env';
import { cors } from 'hono/cors';
import { GetDI } from '../../di';
import {
  GetRequestObjectController,
  PostWalletResponseController,
} from './controller/wallet';
import { HTTPException } from 'hono/http-exception';

/**
 * The WEB API available to the wallet
 */
export class WalletApi<T extends Env> {
  /**
   * The routes available to the wallet
   */
  public route: Hono<Env>;

  constructor(
    requestJWTPath: string,
    presentationDefinitionPath: string,
    walletResponsePath: string,
    getPublicJWKSetPath: string,
    jarmJWKSetPath: string,
    private readonly getDI: GetDI<T>
  ) {
    this.route = new Hono<Env>()
      .use('*', (c, next) => cors({ origin: '*' })(c, next))
      .get(requestJWTPath, this.handleGetRequestObject())
      .get(presentationDefinitionPath, this.handleGetPresentationDefinition())
      .post(walletResponsePath, this.handlePostWalletResponse())
      .get(getPublicJWKSetPath, this.handleGetPublicJwkSet())
      .get(jarmJWKSetPath, this.handleGetJarmJwks());
  }

  /**
   * Handles a request placed by the wallet, input order to obtain
   * the Request Object of the presentation.
   * If found, the Request Object will be returned as JWT
   */
  private handleGetRequestObject(): Handler {
    try {
      const controller = new GetRequestObjectController(this.getDI);

      console.log('GetRequestObjectController created successfully');

      return controller.handler();
    } catch (error) {
      console.error('Failed to create GetRequestObjectController:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      throw new HTTPException(500, {
        message: 'Failed to get request object',
      });
    }
  }
  /**
   * Handles a request placed by wallet, input order to obtain
   * the [PresentationDefinition] of the presentation
   */
  private handleGetPresentationDefinition(): Handler {
    return (_) => {
      throw new HTTPException(500, {
        message: 'Failed to get presentation definition',
      });
      // const { portsInput } = getDI(c);
      // const pdFound = (pd: PresentationDefinition) => c.json(pd, 200);
      // const requestId = new RequestId(c.req.param('requestId'));
      // console.info(
      //   `Handling GetPresentationDefinition for ${requestId.value} ...`
      // );
      // const result = portsInput.getPresentationDefinition(requestId);
      // if (result.constructor === QueryResponse.NotFound) {
      //   return c.text('', 404);
      // }
      // if (result.constructor === QueryResponse.InvalidState) {
      //   return c.text('', 400);
      // }
      // if (result.constructor === QueryResponse.Found) {
      //   return pdFound(
      //     (result as QueryResponse.Found<PresentationDefinition>).value
      //   );
      // }
    };
  }
  /**
   * Handles a POST request placed by the wallet, input order to submit
   * the [AuthorisationResponse], containing the id_token, presentation_submission
   * and the verifiableCredentials
   */
  private handlePostWalletResponse(): Handler {
    try {
      const controller = new PostWalletResponseController(this.getDI);

      console.log('PostWalletResponseController created successfully');

      return controller.handler();
    } catch (error) {
      console.error('Failed to create PostWalletResponseController:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      throw new HTTPException(500, {
        message: 'Failed to post wallet response',
      });
    }
  }

  private handleGetPublicJwkSet(): Handler {
    return (c) => {
      console.info('Handling GetPublicJwkSet ...');
      const jwk = JSON.parse(c.env.JAR_SIGNING_PRIVATE_JWK);
      delete jwk.d;
      const publicJwkSet = {
        keys: [jwk],
      } as jose.JSONWebKeySet;
      return c.json(publicJwkSet, 200, {
        'Content-Type': 'application/jwk-set+json; charset=UTF-8',
      });
    };
  }
  /**
   * Handles the GET request for fetching the JWKS to be used for JARM.
   */
  private handleGetJarmJwks(): Handler {
    return (c) => {
      throw new HTTPException(500, {
        message: 'Failed to get Jarm Jwks',
      });
      // const requestId = new RequestId(c.req.param('requestId'));
      // console.info(`Handling GetJarmJwks for ${requestId.value} ...`);
      // const queryResponse = this.getJarmJwks(requestId);
      // if (queryResponse.constructor === QueryResponse.NotFound) {
      //   return c.text('', 404);
      // }
      // if (queryResponse.constructor === QueryResponse.InvalidState) {
      //   return c.text('', 400);
      // }
      // if (queryResponse.constructor === QueryResponse.Found) {
      //   return c.json(queryResponse, 200, {
      //     'Content-Type': 'application/jwk-set+json; charset=UTF-8',
      //   });
      // }
    };
  }
}
