/* eslint-env node */
import js from '@eslint/js'
import eslintPluginVue from 'eslint-plugin-vue'
import ts from 'typescript-eslint'
import eslintConfigPrettier from "eslint-config-prettier";

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  }
)