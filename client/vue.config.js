module.exports = {
  // 选项...
  devServer: {
    open: true,
    host: 'localhost',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: { // 配置跨域
      '/api': {
        target: 'http://localhost:5000/api',
        ws: true,
        changOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    before: app => { }
  }
}