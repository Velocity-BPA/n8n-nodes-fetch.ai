module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
	},
	env: {
		node: true,
		es2021: true,
	},
	extends: [
		'eslint:recommended',
	],
	plugins: ['@typescript-eslint'],
	rules: {
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		'no-console': ['warn', { allow: ['error', 'warn'] }],
		'prefer-const': 'error',
		'no-var': 'error',
	},
	ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
