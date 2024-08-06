import { PresentationDefinition, PresentationSubmission } from 'oid4vc-prex';
// TODO remove these Mocks

// domain
export class RequestId {
  constructor(public value: string) {}
}
export class TransactionId {
  constructor(public value?: string) {}
}

export class ResponseCode {
  constructor(public value?: string) {}
}

type PresentationRelatedUrlBuilder<ID> = { (arg: ID): string };

export namespace EmbedOption {
  export class ByReference<T> {
    constructor(public value: PresentationRelatedUrlBuilder<T>) {}
  }
}

export type InitTransactionTO = {
  type: any;
  id_token_type: any;
  presentation_definition: any;
  nonce: any;
  response_mode: any;
  jar_mode: any;
  presentation_definition_mode: any;
  wallet_response_redirect_uri_template: any;
};

export type PresentationEventsTO = {
  transaction_id: any;
  last_updated: any;
  events: any;
  nonce: any;
};

export type WalletResponseTO = {
  transaction_id: any;
  last_updated: any;
  events: any;
  nonce: any;
};

export type JwtSecuredAuthorizationRequestTO = {
  transactionId: any;
  clientId: any;
  request: any;
  requestUri: any;
};

// ports/input

export interface QueryResponse<T> {}

export namespace QueryResponse {
  export class NotFound implements QueryResponse<undefined> {}
  export class InvalidState implements QueryResponse<undefined> {}
  export class Found<T> implements QueryResponse<T> {
    constructor(public value: T) {}
  }
}

export interface GetWalletResponse {
  invoke(
    transactionId: TransactionId,
    responseCode?: ResponseCode
  ): WalletResponseTO;
}

export interface InitTransaction {
  invoke(input: InitTransactionTO): JwtSecuredAuthorizationRequestTO;
}

export interface GetPresentationEvents {
  invoke(transactionId: TransactionId): QueryResponse<PresentationEventsTO>;
}

export interface GetJarmJwks {
  invoke(id: RequestId): QueryResponse<PresentationEventsTO>;
}

export interface GetRequestObject {
  invoke(id: RequestId): QueryResponse<string>;
}

export interface GetPresentationDefinition {
  invoke(id: RequestId): QueryResponse<PresentationDefinition>;
}

export interface AuthorisationResponse {}

export class AuthorisationResponseTO {
  constructor(
    public state?: string, // this is the request_id
    public error?: string,
    public errorDescription?: string,
    public idToken?: string,
    public vpToken?: string,
    public presentationSubmission?: PresentationSubmission
  ) {}
}

export class WalletResponseAcceptedTO {
  constructor(public redirectUri: string) {}
}

export namespace AuthorisationResponse {
  export class DirectPost implements AuthorisationResponse {
    constructor(public response: AuthorisationResponseTO) {}
  }
  export class DirectPostJwt implements AuthorisationResponse {
    constructor(public state: string = '', public jarm: string) {}
  }
}
// export class DirectPostJwt(val state: String?, val jarm: Jwt) : AuthorisationResponse

export interface PostWalletResponse {
  invoke(walletResponse: AuthorisationResponse): WalletResponseAcceptedTO;
}
