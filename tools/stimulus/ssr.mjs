/**
 * Server-render Cremona blocks from their TypeScript sources.
 *
 * Blocks are TSX with workspace aliases, so they are loaded through Vite's SSR
 * module loader (the same pipeline as the blocks test suite). Dependencies —
 * react, react-dom, motion, lucide-react, vite — resolve from packages/blocks.
 */
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function createRenderer(root) {
  const blocksDir = join(root, "packages", "blocks");
  const require = createRequire(join(blocksDir, "package.json"));
  const load = (id) => import(pathToFileURL(require.resolve(id)).href);
  const [vite, React, server, lucide] = await Promise.all([
    load("vite"),
    load("react"),
    load("react-dom/server"),
    load("lucide-react"),
  ]);

  const loader = await vite.createServer({
    root: blocksDir,
    configFile: false,
    logLevel: "error",
    appType: "custom",
    server: { middlewareMode: true, hmr: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
    esbuild: { jsx: "automatic" },
    resolve: {
      alias: {
        "@cremona/core/land-mask": join(root, "packages", "core", "src", "land-mask.ts"),
        "@cremona/core": join(root, "packages", "core", "src", "index.ts"),
        "@cremona/react": join(root, "packages", "react", "src", "index.ts"),
      },
    },
  });

  const icons = new Map();
  for (const value of Object.values(lucide)) {
    const name = value?.displayName;
    if (typeof name === "string") icons.set(`lucide:${name}`, value);
  }

  /** preview-props.json values back to props: "lucide:X" icons and { $element } elements. */
  const hydrate = (value) => {
    if (typeof value === "string" && value.startsWith("lucide:")) {
      const icon = icons.get(value);
      if (!icon) throw new Error(`unknown icon ${value}`);
      return icon;
    }
    if (Array.isArray(value)) return value.map(hydrate);
    if (value && typeof value === "object") {
      if (typeof value.$element === "string") {
        const type = value.$element.startsWith("lucide:")
          ? hydrate(value.$element)
          : value.$element;
        return React.createElement(
          type,
          hydrate(value.props ?? {}),
          ...(value.children ?? []).map(hydrate),
        );
      }
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, hydrate(v)]));
    }
    return value;
  };

  const parity = await loader.ssrLoadModule(join(blocksDir, "test", "helpers", "parity.ts"));

  return {
    /** The golden comparator of the blocks test suite (packages/blocks/test/helpers/parity.ts). */
    parity,

    /** The block's component, block.json and hydrated preview props per variant label. */
    async loadBlock(dir, file) {
      const meta = JSON.parse(readFileSync(join(dir, "block.json"), "utf8"));
      const propsPath = join(dir, "preview-props.json");
      const mod = await loader.ssrLoadModule(join(dir, "react.tsx"));
      const props = existsSync(propsPath) ? JSON.parse(readFileSync(propsPath, "utf8")) : null;
      const pascal = file
        .split("-")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join("");
      const candidates = Object.entries(mod).filter(
        ([name, value]) => typeof value === "function" && /^[A-Z]/.test(name),
      );
      const Component = (candidates.find(([name]) => name === pascal) ?? candidates.at(-1))?.[1];
      if (!Component) throw new Error(`${file}: no component export in react.tsx`);
      const variantProps = (label) => {
        if (!props || !(label in props))
          throw new Error(
            `preview-props.json has no "${label}" entry: add the props of the variant`,
          );
        return hydrate(props[label]);
      };
      return { meta, Component, props: variantProps };
    },

    /** Static markup of one render; `prefix` namespaces React's useId values. */
    render(Component, props, prefix) {
      return server.renderToStaticMarkup(React.createElement(Component, props), {
        identifierPrefix: prefix,
      });
    },

    close: () => loader.close(),
  };
}
