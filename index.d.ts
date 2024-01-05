import { FastifyPluginCallback } from 'fastify';

type FastifyTimestampSigner = FastifyPluginCallback<fastifyTimestampSigner.TimestampSignerOptions>;

declare module 'fastify' {
  interface FastifyInstance {
      sign(string: string, options?: fastifyTimestampSigner.SignOptions): Promise<string>;
      validate(signedString: string, maxAge?: number, options?: fastifyTimestampSigner.ValidateOptions): Promise<boolean>;
  }
}

declare namespace fastifyTimestampSigner {
    export interface SignOptions {
        salt: string;
        timestamp?: number;
    }

    export interface ValidateOptions {
        salt: string;
        validateTime?: number;
    }

    export interface TimestampSignerOptions {
        secret: string;
        algorithm?: string;
        delimiter?: string;
        encoding?: string;
    }

    export const fastifyTimestampSigner: FastifyTimestampSigner;
    export { fastifyTimestampSigner as default };
}

declare function fastifyTimestampSigner(
  ...params: Parameters<FastifyTimestampSigner>
): ReturnType<FastifyTimestampSigner>;

export = fastifyTimestampSigner;

