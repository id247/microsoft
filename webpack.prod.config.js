'use strict';

var webpack = require('webpack');
var path = require('path');

var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');
var pathToReactDOM = path.resolve(node_modules, 'react-dom/dist/react-dom.min.js');

module.exports = {
	cache: true,
	entry: {
		dnevnik: './src/js/dnevnik',
		mosreg: './src/js/mosreg'
	},
	output: {
		path: __dirname + '/production/assets/js',
		filename: '[name].js',
		publicPath: __dirname + '/production/assets/js',
		pathinfo: true
	},

	resolve: {
		modulesDirectories: ['node_modules'],
		extentions: ['', '.js'],
		alias: {
		  'react': pathToReact,
		  'react-dom': pathToReactDOM
		}
	},

	module: {
		noParse: [
		   pathToReact,
		],
		loaders: [
			{   test: /\.js$/, 
				include: [
					__dirname + '/src/js'
				], 
				loader: 'babel?optional[]=runtime&stage=2',
			},
			{ 	test: /\.js$/, 
				include: [
					__dirname + '/src/js'
				], 
				loader: 'strip-loader?strip[]=console.log' 
			}
		]
	},
	plugins: [     
		new webpack.DefinePlugin({
			'process.env': { 
				NODE_ENV : JSON.stringify('production') 
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			minimize: true,
			compress: {
				warnings: false
			}
		})
	]
};

