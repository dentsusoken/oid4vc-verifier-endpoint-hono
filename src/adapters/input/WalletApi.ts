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
import {
  Jwt,
  QueryResponse,
  AuthorizationResponse,
  AuthorizationResponseData,
  EmbedOption,
  RequestId,
  UrlBuilder,
} from 'oid4vc-verifier-endpoint-core';
import { PresentationExchange } from 'oid4vc-prex';
import { getDI } from './getDI';
import { Env } from '../../env';

/**
 * The WEB API available to the wallet
 */
export class WalletApi {
  /**
   * The routes available to the wallet
   */
  public route: Hono<Env>;

  constructor(
    requestJWTPath: string,
    presentationDefinitionPath: string,
    walletResponsePath: string,
    getPublicJWKSetPath: string,
    jarmJWKSetPath: string
  ) {
    this.route = new Hono<Env>()
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
    return async (c) => {
      const requestObjectFound = (jwt: string) =>
        c.text(jwt, 200, { 'Content-Type': 'application/oauth-authz-req+jwt' });

      const { portsInput } = getDI(c);
      const getRequestObject = portsInput.getRequestObject();
      const requestId = new RequestId(c.req.param('requestId'));

      console.info(`Handling GetRequestObject for ${requestId.value} ...`);

      const result = await getRequestObject(requestId);
      if (result.constructor === QueryResponse.Found) {
        return requestObjectFound((result as QueryResponse.Found<Jwt>).value);
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
      return c.text('', 404);
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
    return async (c) => {
      try {
        const { portsInput } = getDI(c);
        const postWalletResponse = portsInput.postWalletResponse();

        console.info('Handling PostWalletResponse ...');

        const walletResponse = await WalletApi.walletResponse(
          Object.fromEntries((await c.req.formData()).entries())
        );
        try {
          const result = await postWalletResponse(walletResponse);
          const response = result.getOrThrow();
          console.info('PostWalletResponse processed');
          if (!response) {
            console.info('Verifier UI will poll for Wallet Response');
            return c.json({}, 200);
          } else {
            console.info(`Wallet must redirect to ${response.redirectUri}`);
            return c.json({ redirect_uri: response.redirectUri }, 200);
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
      return c.text('', 404);
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
export namespace WalletApi {
  export const walletResponse = async (
    req: Record<string, string | undefined>
  ): Promise<AuthorizationResponse> => {
    const directPost = async () => {
      const {
        state,
        id_token,
        vp_token,
        presentation_submission,
        error,
        error_description,
      } = req;

      const response: AuthorizationResponseData = {
        state,
        error,
        errorDescription: error_description,
        idToken: id_token,
        vpToken: vp_token,
        presentationSubmission:
          (
            await PresentationExchange.jsonParse.decodePresentationSubmission(
              presentation_submission!
            )
          ).getOrNull() || undefined,
      };
      return new AuthorizationResponse.DirectPost(response);
    };

    const directPostJwt = () => {
      const { state, response: jwt } = req;
      if (!jwt || !state) {
        return;
      }
      return new AuthorizationResponse.DirectPostJwt(state, jwt);
    };

    return directPostJwt() || (await directPost());
  };

  // export const requestJwtByReference = (baseUrl: string) => {
  //   return urlBuilder(baseUrl, REQUEST_JWT_PATH);
  // };
  // export const presentationDefinitionByReference = (baseUrl: string) => {
  //   return urlBuilder(baseUrl, PRESENTATION_DEFINITION_PATH);
  // };
  // export const publicJwkSet = (baseUrl: string) => {
  //   return `${baseUrl}${GET_PUBLIC_JWK_SET_PATH}`;
  // };
  // export const jarmJwksByReference = (baseUrl: string) => {
  //   return urlBuilder(baseUrl, GET_PUBLIC_JWK_SET_PATH);
  // };

  // export const directPost = (baseUrl: string) => {
  //   return `${baseUrl}${WALLET_RESPONSE_PATH}`;
  // };

  export const urlBuilder = (baseUrl: string, pathTemplate: string) => {
    return new EmbedOption.ByReference(
      new UrlBuilder.Fix(`${baseUrl}${pathTemplate}`)
    );

    // return new EmbedOption.ByReference(function (requestId: RequestId) {
    //   return `${baseUrl}${pathTemplate.replace(':requestId', requestId.value)}`;
    // });
  };
}
