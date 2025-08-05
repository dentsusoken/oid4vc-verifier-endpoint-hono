import { Context } from 'hono';
import { CloudflareEnv } from '../../env';
import {
  Configuration,
  PortsOutImpl as PortsOutImplCore,
  LoadPresentationById,
  LoadPresentationByRequestId,
  StorePresentation,
} from '@vecrea/oid4vc-verifier-endpoint-core';
import { PresentationKVStore } from '../../adapters/out/persistence/PresentationKVStore';

export class PortsOutImpl extends PortsOutImplCore {
  #presentationKVStore: PresentationKVStore;

  /**
   * Creates an instance of HonoPortsOut.
   * @constructor
   * @param {Configuration} configuration - The configuration object.
   * @param {Context<CloudflareEnv>} c - The Hono context object.
   */
  constructor(configuration: Configuration, c: Context<CloudflareEnv>) {
    super(configuration);
    this.#presentationKVStore = new PresentationKVStore(c.env.PRESENTATION_KV);
  }

  /**
   * Returns a function to load a presentation by its ID.
   * @returns {LoadPresentationById} A function to load a presentation by ID.
   */
  loadPresentationById = (): LoadPresentationById =>
    this.#presentationKVStore.loadPresentationById;

  /**
   * Returns a function to load a presentation by its request ID.
   * @returns {LoadPresentationByRequestId} A function to load a presentation by request ID.
   */
  loadPresentationByRequestId = (): LoadPresentationByRequestId =>
    this.#presentationKVStore.loadPresentationByRequestId;

  /**
   * Returns a function to store a presentation.
   * @returns {StorePresentation} A function to store a presentation.
   */
  storePresentation = (): StorePresentation =>
    this.#presentationKVStore.storePresentation;
}
