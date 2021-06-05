import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from "rollup-plugin-postcss";

// import monaco from 'rollup-plugin-monaco-editor';
import pkg from './package.json';

export default [
	{
		input: pkg.main,
        external: ['../node_modules/monaco-editor/esm/vs/editor/standalone/browser/standalone-tokens.css'],
		output: {
			name: 'NetlessMonacoPlugin',
			file: pkg.browser,
            format: 'umd'
		},
		plugins: [
			resolve(),
            commonjs(),
            postcss({
                plugins: []
            })
		]
	},
];
