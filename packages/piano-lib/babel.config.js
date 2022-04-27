module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
      '@babel/preset-typescript',
    ],
    env: {
      build: {
        ignore: ['**/*.test.ts', '__snapshots__'],
      },
    },
    ignore: ['node_modules'],
  };
};
