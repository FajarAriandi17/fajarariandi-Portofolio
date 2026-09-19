import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * Flat-config wrapper around the Next.js shared config.
 *
 * `next lint` is deprecated in Next 15 and gone in 16; this lets `npm run lint`
 * (plain `eslint .`) run the same `next/core-web-vitals` rules in CI without an
 * interactive prompt.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "testsprite_tests/**",
      "portofolio/**",
      "tmp_*.mjs",
      "tmp_*.js",
      "tmp_*.py",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
