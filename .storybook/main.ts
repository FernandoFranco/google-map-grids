import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    '@chromatic-com/storybook',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/react-vite',
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldRemoveUndefinedFromOptional: true,
      tsconfigPath: './tsconfig.json',
      exclude: ['**/.storybook/**'],
    },
  },
  viteFinal: async (config) => {
    if (process.env.BASE_PATH) {
      config.base = process.env.BASE_PATH;
    }
    return config;
  },
};

export default config;
