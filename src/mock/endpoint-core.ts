// TODO remove these Mocks

// domain
export class TransactionId {
  constructor(public value?: string) {}
}

export class ResponseCode {
  constructor(public value?: string) {}
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
