import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * ESLint configuration for the server-side code.
 * This configuration uses the flat config format.
 */
export default tseslint.config(
  // We ignore the 'dist' directory which contains the compiled output.
  { ignores: ['dist'] },
  {
    // Apply these rules to all TypeScript and JavaScript files in the 'src' directory.
    files: ['src/**/*.ts', 'src/**/*.js'],
    // Extends recommended rule sets from ESLint and typescript-eslint.
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    // Language and environment-specific options.
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
      },
    },

    // Custom rules to enforce code style and catch potential errors.
    rules: {
      // Enforce consistent spacing inside object braces.
      'object-curly-spacing': ['warn', 'always'],

      // Configure the 'no-unused-vars' rule from typescript-eslint.
      // This helps catch unused variables but ignores ones starting with an underscore (_).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          args: 'after-used',
          vars: 'all',
          caughtErrors: 'all',
        },
      ],
    },
  },
);
