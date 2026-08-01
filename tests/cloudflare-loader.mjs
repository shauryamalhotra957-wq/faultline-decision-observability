import { extname } from "node:path";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") {
    return {
      url: "data:text/javascript,export const env = {};",
      shortCircuit: true,
    };
  }

  if (specifier.startsWith(".") && !extname(specifier)) {
    for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
      try {
        return await nextResolve(candidate, context);
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !("code" in error) ||
          !["ERR_MODULE_NOT_FOUND", "ERR_UNSUPPORTED_DIR_IMPORT"].includes(error.code)
        ) {
          throw error;
        }
      }
    }
  }

  return nextResolve(specifier, context);
}
