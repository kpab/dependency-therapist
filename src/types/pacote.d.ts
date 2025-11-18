declare module 'pacote' {
  export interface Manifest {
    name: string;
    version: string;
    deprecated?: string;
    time?: {
      modified?: string;
      created?: string;
      [version: string]: string | undefined;
    };
    [key: string]: any;
  }

  export function manifest(spec: string, opts?: any): Promise<Manifest>;
  export function packument(spec: string, opts?: any): Promise<any>;
  export function tarball(spec: string, opts?: any): Promise<Buffer>;
  export function extract(spec: string, dest: string, opts?: any): Promise<void>;
}
