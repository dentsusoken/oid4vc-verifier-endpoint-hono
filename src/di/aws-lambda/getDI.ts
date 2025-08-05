import { Context } from 'hono';
import { ConfigurationImpl } from './ConfigurationImpl';
import { PortsInputImpl } from '@vecrea/oid4vc-verifier-endpoint-core';
import { PortsOutImpl } from './PortsOutImpl';
import { AwsEnv } from '../../env';
import { GetDI } from '..';

export const getDI: GetDI<AwsEnv> = (c: Context<AwsEnv>) => {
  // Validate context parameter
  if (!c) {
    throw new TypeError(
      'Context parameter is required for dependency injection setup'
    );
  }

  try {
    // Create configuration with environment validation
    const config = new ConfigurationImpl(c);

    // Create output ports with proper error handling
    const portsOut = new PortsOutImpl(config, c);

    // Create input ports with dependency injection
    const portsInput = new PortsInputImpl(config, portsOut);

    return { config, portsOut, portsInput };
  } catch (error) {
    // Enhanced error context for debugging
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to initialize dependency injection container: ${errorMessage}. ` +
        'Please check that all required environment variables and bindings are configured.'
    );
  }
};
