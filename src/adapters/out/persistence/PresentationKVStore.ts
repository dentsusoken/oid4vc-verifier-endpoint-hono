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

import {
  LoadPresentationById,
  LoadPresentationByRequestId,
  Presentation,
  StorePresentation,
  TransactionId,
  RequestId,
  presentationSchema,
} from 'oid4vc-verifier-endpoint-core';

/**
 * Prefix for ID keys in the KV store.
 * @constant {string}
 */
const ID_PREFIX = 'v1:id:';

/**
 * Prefix for request ID keys in the KV store.
 * @constant {string}
 */
const REQUEST_ID_PREFIX = 'v1:request_id:';

/**
 * Time-to-live duration for KV store entries (24 hours in seconds).
 * @constant {number}
 */
const ONE_DAY_TTL = 24 * 60 * 60;

/**
 * Options for putting values in the KV store, including expiration time.
 * @constant {KVNamespacePutOptions}
 */
const putOptions: KVNamespacePutOptions = { expirationTtl: ONE_DAY_TTL };

/**
 * Generates a key for storing a presentation by its ID.
 * @param {string} id - The presentation ID.
 * @returns {string} The generated key.
 */
export const idKey = (id: string) => `${ID_PREFIX}${id}`;

/**
 * Generates a key for storing a presentation by its request ID.
 * @param {string} requestId - The request ID.
 * @returns {string} The generated key.
 */
export const requestIdKey = (requestId: string) =>
  `${REQUEST_ID_PREFIX}${requestId}`;

/**
 * Class representing a KV store for Presentations.
 */
export class PresentationKVStore {
  /**
   * Creates an instance of PresentationKVStore.
   * @param {KVNamespace} kv - The KV namespace to use for storage.
   */
  constructor(private kv: KVNamespace) {}

  /**
   * Loads a Presentation by its ID.
   * @param {TransactionId} id - The ID of the Presentation to load.
   * @returns {Promise<Presentation | undefined>} The loaded Presentation, or undefined if not found.
   */
  loadPresentationById: LoadPresentationById = async (id: TransactionId) => {
    const jsonStr = await this.kv.get(idKey(id.value));

    if (!jsonStr) {
      return undefined;
    }

    const json = JSON.parse(jsonStr);
    const parsed = presentationSchema.parse(json);

    return Presentation.fromJSON(parsed);
  };

  /**
   * Loads a Presentation by its request ID.
   * @param {RequestId} requestId - The request ID of the Presentation to load.
   * @returns {Promise<Presentation | undefined>} The loaded Presentation, or undefined if not found.
   */
  loadPresentationByRequestId: LoadPresentationByRequestId = async (
    requestId: RequestId
  ) => {
    const id = await this.kv.get(requestIdKey(requestId.value));

    if (!id) {
      return undefined;
    }

    return this.loadPresentationById(new TransactionId(id));
  };

  /**
   * Stores a Presentation in the KV store.
   * @param {Presentation} presentation - The Presentation to store.
   * @returns {Promise<void>}
   */
  storePresentation: StorePresentation = async (presentation: Presentation) => {
    const json = presentation.toJSON();
    const jsonStr = JSON.stringify(json);

    await this.kv.put(idKey(presentation.id.value), jsonStr, putOptions);
    await this.kv.put(
      requestIdKey(presentation.requestId.value),
      presentation.id.value,
      putOptions
    );
  };
}
