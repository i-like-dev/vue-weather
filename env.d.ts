/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_CWA: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
