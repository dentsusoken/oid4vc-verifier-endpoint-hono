import { Handler } from 'hono';
import { AbstractController } from '../AbstractController';
import { Env } from '../../../../env';
import { GetDI } from '../../../../di';
import {
  AuthorizationResponse,
  AuthorizationResponseData,
} from '@vecrea/oid4vc-verifier-endpoint-core';
import { PresentationExchange } from '@vecrea/oid4vc-prex';

export class PostWalletResponseController<
  T extends Env
> extends AbstractController<T> {
  constructor(private readonly getDI: GetDI<T>) {
    super();
  }
  handler(): Handler {
    return async (c) => {
      const { portsInput, config } = this.getDI(c);
      const postWalletResponse = portsInput.postWalletResponse();

      console.info('Handling PostWalletResponse ...');
      try {
        const walletResponse = await this.parseWalletResponse(
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
          console.error('While handling post of wallet response ', e);
          return this.handleError(c, config, e as Error, 400);
        }
      } catch (e) {
        console.error(
          'While handling post of wallet response failed to decode JSON',
          e
        );
        return this.handleError(c, config, e as Error, 400);
      }
    };
  }

  private parseWalletResponse = async (
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
        presentationSubmission: (
          await PresentationExchange.jsonParse.decodePresentationSubmission(
            presentation_submission!
          )
        ).value,
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
}
