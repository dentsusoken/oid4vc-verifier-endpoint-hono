import { ClientIdSchemeName } from 'oid4vc-verifier-endpoint-core';

export type Env = {
  Bindings: {
    JAR_SIGNING_PRIVATE_JWK: string;
    JAR_SIGNING_PUBLIC_JWK: string;
    CLIENT_ID: string;
    CLIENT_ID_SCHEME: ClientIdSchemeName;
    PUBLIC_URL: string;
    CORS_ORIGIN: string;
  };
};
