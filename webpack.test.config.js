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
	devtool: '#inline-source-map',
	output: {
		path: __dirname + '/dist/assets/js',
		filename: '[name].js',
		publicPath: __dirname + '/dist/assets/js',
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
			}
		]
	},
	plugins: []
};

