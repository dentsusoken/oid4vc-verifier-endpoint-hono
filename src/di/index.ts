import {
  Configuration,
  PortsInput,
  PortsOut,
} from '@vecrea/oid4vc-verifier-endpoint-core';
import { Context } from 'hono';
import { Env } from '../env';

export type GetDI<T extends Env> = (c: Context<T>) => {
  portsInput: PortsInput;
  portsOut: PortsOut;
  config: Configuration;
};
