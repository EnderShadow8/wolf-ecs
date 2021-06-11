import dts from "rollup-plugin-dts"

export default [
  {
    input: "build/index.js",
    output: {
      file: "dist/wolf-ecs.js",
      format: "es",
    },
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
