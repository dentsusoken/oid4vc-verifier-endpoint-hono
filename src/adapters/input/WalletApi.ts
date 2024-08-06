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
import {
  AuthorisationResponse,
  AuthorisationResponseTO,
  GetJarmJwks,
  GetPresentationDefinition,
  GetRequestObject,
  PostWalletResponse,
  QueryResponse,
  RequestId,
} from '../../mock/endpoint-core';
import { Handler, Hono } from 'hono';
import { PresentationDefinition, PresentationExchange } from 'oid4vc-prex';

const GET_PUBLIC_JWK_SET_PATH = '/wallet/public-keys.json';

/**
 * Path template for the route for
 * getting the presentation's request object
 */
const REQUEST_JWT_PATH = '/wallet/request.jwt/:requestId';

/**
 * Path template for the route for
 * getting the presentation definition
 */
const PRESENTATION_DEFINITION_PATH = '/wallet/pd/:requestId';

/**
 * Path template for the route for getting the JWKS that contains the Ephemeral Key for JARM.
 */
const JARM_JWK_SET_PATH = '/wallet/jarm/:requestId/jwks.json';

/**
 * Path template for the route for
 * posting the Authorisation Response
 */
const WALLET_RESPONSE_PATH = '/wallet/direct_post';

/**
 * The WEB API available to the wallet
 */
export class WalletApi {
  constructor(
    private getRequestObject: GetRequestObject,
    private getPresentationDefinition: GetPresentationDefinition,
    private postWalletResponse: PostWalletResponse,
    private getJarmJwks: GetJarmJwks,
    private signingKey: jose.JWK
  ) {}

  /**
   * The routes available to the wallet
   */
  public route = new Hono()
    .get(REQUEST_JWT_PATH, this.handleGetRequestObject())
    .get(PRESENTATION_DEFINITION_PATH, this.handleGetPresentationDefinition())
    .post(WALLET_RESPONSE_PATH, this.handlePostWalletResponse())
    .get(GET_PUBLIC_JWK_SET_PATH, this.handleGetPublicJwkSet())
    .get(JARM_JWK_SET_PATH, this.handleGetJarmJwks());

  /**
   * Handles a request placed by the wallet, input order to obtain
   * the Request Object of the presentation.
   * If found, the Request Object will be returned as JWT
   */
  private handleGetRequestObject(): Handler {
    return (c) => {
      const requestObjectFound = (jwt: string) =>
        c.text(jwt, 200, { 'Content-Type': 'application/oauth-authz-req+jwt' });

      const requestId = new RequestId(c.req.param('requestId'));
      console.info(`Handling GetRequestObject for ${requestId.value} ...`);
      const result = this.getRequestObject.invoke(requestId);
      if (result.constructor === QueryResponse.Found) {
        return requestObjectFound(
          (result as QueryResponse.Found<string>).value
        );
      }
      if (result.constructor === QueryResponse.NotFound) {
        return c.text('', 404);
      }
      if (result.constructor === QueryResponse.InvalidState) {
        return c.text('', 400);
      }
    };
  }
  /**
   * Handles a request placed by wallet, input order to obtain
   * the [PresentationDefinition] of the presentation
   */
  private handleGetPresentationDefinition(): Handler {
    return (c) => {
      const pdFound = (pd: PresentationDefinition) => c.json(pd, 200);

      const requestId = new RequestId(c.req.param('requestId'));
      console.info(
        `Handling GetPresentationDefinition for ${requestId.value} ...`
      );
      const result = this.getPresentationDefinition.invoke(requestId);
      if (result.constructor === QueryResponse.NotFound) {
        return c.text('', 404);
      }
      if (result.constructor === QueryResponse.InvalidState) {
        return c.text('', 400);
      }
      if (result.constructor === QueryResponse.Found) {
        return pdFound(
          (result as QueryResponse.Found<PresentationDefinition>).value
        );
      }
    };
  }
  /**
   * Handles a POST request placed by the wallet, input order to submit
   * the [AuthorisationResponse], containing the id_token, presentation_submission
   * and the verifiableCredentials
   */
  private handlePostWalletResponse(): Handler {
    return async (c) => {
      try {
        console.info('Handling PostWalletResponse ...');
        const walletResponse = await WalletApi.walletResponse(
          JSON.parse((await c.req.formData()).get('walletResponse') || '{}')
        );
        console.log('walletResponse :>> ', walletResponse);
        try {
          // TODO - this is not correct
          const response = this.postWalletResponse.invoke(walletResponse);
          console.info('PostWalletResponse processed');
          if (!response) {
            console.info('Verifier UI will poll for Wallet Response');
            return c.json({}, 200);
          } else {
            console.info(`Wallet must redirect to ${response.redirectUri}`);
            return c.json(response, 200);
          }
        } catch (e) {
          console.error('$error while handling post of wallet response ');
          return c.text('', 400);
        }
      } catch (e) {
        console.error(
          'While handling post of wallet response failed to decode JSON',
          e
        );
        return c.text('', 400);
      }
    };
  }

  private handleGetPublicJwkSet(): Handler {
    return (c) => {
      console.info('Handling GetPublicJwkSet ...');
      const publicJwkSet = {
        keys: [this.signingKey],
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
      const requestId = new RequestId(c.req.param('requestId'));
      console.info(`Handling GetJarmJwks for ${requestId.value} ...`);

      const queryResponse = this.getJarmJwks.invoke(requestId);

      if (queryResponse.constructor === QueryResponse.NotFound) {
        return c.text('', 404);
      }
      if (queryResponse.constructor === QueryResponse.InvalidState) {
        return c.text('', 400);
      }
      if (queryResponse.constructor === QueryResponse.Found) {
        return c.json(queryResponse, 200, {
          'Content-Type': 'application/jwk-set+json; charset=UTF-8',
        });
      }
    };
  }
}
export namespace WalletApi {
  export const walletResponse = async (
    req: Record<string, string | undefined>
  ): Promise<AuthorisationResponse> => {
    const directPost = async () => {
      const {
        state,
        idToken,
        vpToken,
        presentationSubmission,
        error,
        errorDescription,
      } = req;

      console.log('req :>> ', req);

      const response = new AuthorisationResponseTO(
        state,
        error,
        errorDescription,
        idToken,
        vpToken,
        (
          await PresentationExchange.jsonParse.decodePresentationSubmission(
            presentationSubmission!
          )
        ).getOrNull() || undefined
      );
      return new AuthorisationResponse.DirectPost(response);
    };

    const directPostJwt = () => {
      const { state, response: jwt } = req;
      if (!jwt) {
        return;
      }
      return new AuthorisationResponse.DirectPostJwt(state, jwt);
    };

    return directPostJwt() || (await directPost());
  };
}
