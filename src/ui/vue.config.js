const webpack = require('webpack');

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
      }),
    ],
  },
  chainWebpack: (config) => {
    config.module.rule('vue').uses.delete('cache-loader');
    config.module.rule('js').uses.delete('cache-loader');
    config.module.rule('ts').uses.delete('cache-loader');
    config.module.rule('tsx').uses.delete('cache-loader');

    config.module
      .rule('worker')
      .test(/\.worker.js$/)
      .use('worker-loader')
      .loader('worker-loader')
      .tap(() => ({
        inline: true,
      }))
      .end();
  },
};
