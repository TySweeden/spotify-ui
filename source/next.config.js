const withCSS = require('@zeit/next-css')
const withSass = require('@zeit/next-sass')
const withLess = require('@zeit/next-less')
const darkTheme = require('@ant-design/dark-theme');

module.exports = {
  loader: 'less-loader',
  options: {
    modifyVars: darkTheme.darkTheme,
  },
}

module.exports = {
	exportPathMap: function() {
		return {
		  '/': { page: '/' }
		};
	}
  };

  if (typeof require !== 'undefined') {
    require.extensions['.less'] = file => { }
  }
  
  module.exports = withLess(withSass(withCSS({
    lessLoaderOptions: {
      javascriptEnabled: true
    },
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });

      config.module.rules.push({
        test: /\.(eot|ttf|woff|woff2|jpg|png)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000
          }
        }
      });
  
      return config;
    }
  })))