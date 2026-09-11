export async function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") {
    return {
      url: "data:text/javascript,export const env = {};",
      shortCircuit: true,
    };
  }
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err.code === "ERR_MODULE_NOT_FOUND" && (specifier.startsWith(".") || specifier.startsWith("/"))) {
      for (const ext of [".ts", ".tsx", ".js", "/index.ts", "/index.js"]) {
        try {
          return await nextResolve(`${specifier}${ext}`, context);
        } catch {}
      }
    }
    throw err;
  }
}
