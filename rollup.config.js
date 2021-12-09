import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.js',
  output:{
    name: 'proxy-mini',
    file: 'dist/proxyMini.esm.js',
    format: 'es'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true,
    }),
    terser()
  ],
  ignore: [
    "node_modules/**"
  ]
}