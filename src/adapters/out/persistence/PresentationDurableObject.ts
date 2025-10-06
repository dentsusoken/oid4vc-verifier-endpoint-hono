import {
  LoadPresentationById,
  LoadPresentationByRequestId,
  Presentation,
  PresentationJSON,
  presentationSchema,
  StorePresentation,
  TransactionId,
} from '@vecrea/oid4vc-verifier-endpoint-core';
import { DurableObject } from 'cloudflare:workers';
import { Env } from 'hono';

/**
 * Presentation information stored within the Durable Object
 *
 * @interface StoredPresentation
 */
interface StoredPresentation {
  /** Presentation JSON data or string format */
  data: string | PresentationJSON;

  /** Expiration timestamp in milliseconds */
  expiresAt: number;
}

/**
 * Time-to-live duration for Durable Object storage entries (24 hours in milliseconds).
 * @constant {number}
 */
const ONE_DAY_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Duration for setting the next alarm for garbage collection (24 hours in milliseconds).
 * @constant {number}
 */
const ALARM_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Durable Object class for persisting presentation information
 *
 * Temporarily stores OID4VC presentation requests and responses,
 * providing automatic expiration management and garbage collection.
 * Features a 24-hour TTL with periodic alarms to clean up expired data.
 *
 * @example
 * ```typescript
 * const stub = env.PRESENTATION_DO.get(id);
 * await stub.save('key', presentationData);
 * const data = await stub.get('key');
 * ```
 *
 */
export class PresentationDurableObject extends DurableObject {
  /**
   * Creates a new PresentationDurableObject instance
   *
   * @param ctx - Durable Object state context
   * @param env - Environment variables and bindings
   */
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  /**
   * Saves presentation data
   *
   * @param key - The key to store under
   * @param data - Presentation JSON data or string
   * @returns Promise that resolves when save is complete
   *
   * @example
   * ```typescript
   * await durableObject.save('presentation:123', presentationJson);
   * ```
   */
  async save(key: string, data: string | PresentationJSON): Promise<void> {
    // Store data with expiration timestamp
    await this.ctx.storage.put<StoredPresentation>(key, {
      data,
      expiresAt: Date.now() + ONE_DAY_TTL_MS,
    });

    // Ensure garbage collection alarm is set
    await this.setNextAlarm();
  }

  /**
   * Retrieves presentation data for the specified key
   *
   * @param key - The key to retrieve
   * @returns Presentation data or undefined if not found
   *
   * @example
   * ```typescript
   * const data = await durableObject.get('presentation:123');
   * if (data) {
   *   // Handle data if it exists
   * }
   * ```
   */
  async get(key: string): Promise<string | PresentationJSON | undefined> {
    // Retrieve stored data from Durable Object storage
    const storedData = await this.ctx.storage.get<StoredPresentation>(key);

    // Return undefined if data doesn't exist
    if (!storedData) {
      return undefined;
    }

    // Return the actual presentation data
    return storedData.data;
  }

  /**
   * Sets the next alarm for garbage collection
   *
   * Does nothing if an alarm is already set.
   * Sets an alarm 24 hours from now for garbage collection.
   *
   * @private
   */
  private async setNextAlarm() {
    // Check if an alarm is already scheduled
    const alarm = await this.ctx.storage.getAlarm();
    if (alarm && alarm > 0) {
      return; // Alarm already exists, nothing to do
    }

    // Schedule the next garbage collection alarm
    await this.ctx.storage.setAlarm(Date.now() + ALARM_DURATION_MS);
  }

  /**
   * Alarm handler for garbage collection of expired data
   *
   * Executed periodically to automatically delete presentation data
   * that has passed its expiration time. Sets the next alarm after completion.
   *
   * @async
   */
  async alarm(): Promise<void> {
    const now = Date.now();

    // Get all stored data for expiration check
    const allData = await this.ctx.storage.list<StoredPresentation>();

    // Delete expired entries
    for (const [key, value] of allData) {
      if (value.expiresAt < now) {
        await this.ctx.storage.delete(key);
      }
    }

    // Schedule the next garbage collection cycle
    await this.setNextAlarm();
  }
}

/**
 * Prefix for ID keys in the Durable Object storage.
 * @constant {string}
 */
const ID_PREFIX = 'v1:id:';

/**
 * Prefix for request ID keys in the Durable Object storage.
 * @constant {string}
 */
const REQUEST_ID_PREFIX = 'v1:request_id:';

/**
 * Generates a key for storing a presentation by its ID in Durable Object storage.
 * @param id - The presentation ID
 * @returns The generated storage key
 */
export const idKey = (id: string) => `${ID_PREFIX}${id}`;

/**
 * Generates a key for storing a presentation by its request ID in Durable Object storage.
 * @param requestId - The request ID
 * @returns The generated storage key
 */
export const requestIdKey = (requestId: string) =>
  `${REQUEST_ID_PREFIX}${requestId}`;

/**
 * Creates a load function for presentations by ID
 *
 * @param stub - PresentationDurableObject stub
 * @returns Function to load presentations by presentation ID
 *
 * @example
 * ```typescript
 * const loadById = createLoadPresentationById(durableObjectStub);
 * const presentation = await loadById(new TransactionId('123'));
 * ```
 */
export const createLoadPresentationById = (
  stub: DurableObjectStub<PresentationDurableObject>
): LoadPresentationById => {
  return async (id) => {
    // Retrieve presentation data by ID
    const json = await stub.get(idKey(id.value));

    // Validate and parse the data
    const parsed = presentationSchema.parse(json);

    // Convert to Presentation object
    return Presentation.fromJSON(parsed);
  };
};

/**
 * Creates a presentation load function by request ID
 *
 * @param stub - PresentationDurableObject stub
 * @param loadPresentationById - Load function for presentations by ID
 * @returns Function to load presentations by request ID
 *
 * @example
 * ```typescript
 * const loadByRequestId = createLoadPresentationByRequestId(
 *   durableObjectStub,
 *   loadById
 * );
 * const presentation = await loadByRequestId(new TransactionId('req-123'));
 * ```
 */
export const createLoadPresentationByRequestId = (
  stub: DurableObjectStub<PresentationDurableObject>,
  loadPresentationById: LoadPresentationById
): LoadPresentationByRequestId => {
  return async (requestId) => {
    // Look up the presentation ID using the request ID
    const id = await stub.get(requestIdKey(requestId.value));

    // Return undefined if mapping doesn't exist or is invalid
    if (!id || typeof id !== 'string') {
      return undefined;
    }

    // Load the actual presentation using the found ID
    return loadPresentationById(new TransactionId(id));
  };
};

/**
 * Creates a presentation storage function
 *
 * @param stub - PresentationDurableObject stub
 * @returns Function to store presentations
 *
 * @example
 * ```typescript
 * const storePresentation = createStorePresentation(durableObjectStub);
 * await storePresentation(presentation);
 * ```
 */
export const createStorePresentation = (
  stub: DurableObjectStub<PresentationDurableObject>
): StorePresentation => {
  return async (presentation: Presentation) => {
    // Convert presentation to JSON format
    const json = presentation.toJSON();

    // Store the presentation data indexed by presentation ID
    await stub.save(idKey(presentation.id.value), json);

    // Create mapping from request ID to presentation ID for lookups
    await stub.save(
      requestIdKey(presentation.requestId.value),
      presentation.id.value
    );
  };
};
