import dts from "rollup-plugin-dts"
import {terser} from "rollup-plugin-terser"

export default [
  {
    input: "build/index.js",
    output: {
      file: "dist/wolf-ecs.js",
      format: "es",
    },
  },
  {
    input: "build/index.js",
    output: {
      file: "dist/wolf-ecs.min.js",
      format: "es",
    },
    plugins: [terser()],
  },
  {
    input: "build/index.d.ts",
    output: {
      file: "dist/wolf-ecs.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
]
