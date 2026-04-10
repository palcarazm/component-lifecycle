import path from "node:path";
import { fileURLToPath } from "node:url";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";
import { readFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, "package.json"), "utf8"));

const banner = `/* Copyright Notice
 * ${pkg.name} v${pkg.version}
 * ${pkg.homepage}
 * @author ${pkg.author.name} 
 * @see ${pkg.author.url}
 * @funding ${pkg.funding.type}
 * @see ${pkg.funding.url}
 * @license ${pkg.license}
 */`;


const jsConfig = {
    input: "dist/tmp/ts/index.js",
    output: [
        {
            file: "dist/index.cjs",
            format: "cjs",
            sourcemap: true,
            banner,
        },
        {
            file: "dist/index.mjs",
            format: "esm",
            sourcemap: true,
            banner,
        },
    ],
    plugins: [
        terser({
            format: {
                comments: "some",
            },
        }),
    ],
};

const typesConfig = {
    input: "dist/tmp/@types/index.d.ts",
    output: {
        file: "dist/index.d.ts",
        format: "es",
        banner,
    },
    plugins: [dts()],
};

export default [
    jsConfig,
    typesConfig,
];
