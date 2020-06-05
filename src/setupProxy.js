const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = app => {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.inventory.dev.external.hollywood.com',
      changeOrigin: true,
      pathRewrite: path => path.replace(/^\/api/, ''),
    }),
  );
};
