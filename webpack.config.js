const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const cssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const terserWebpackPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = ()=>{
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if(isProd){
        config.minimizer = [
            new cssMinimizerWebpackPlugin(),
            new terserWebpackPlugin(),
        ]
    }
    return config
}

const babelOptions = preset => {
    const options = {
        presets: [
            '@babel/preset-env',
        ],
        plugins: ['@babel/plugin-proposal-class-properties']
    }

    preset && options.presets.push(preset)
    return options
}

const jsLoaders = () => {
    const loaders = [{
        loader: 'babel-loader',
        options: babelOptions(),
    }]
    // if (isDev) {
        // loaders.push('eslint-loader')
    // }
    return loaders
}

const fileName = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

console.log('isDev', isDev)

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        main:['@babel/polyfill','./index.jsx'],
        // analitics: './analitics.ts',
        // babel: './babel.js'
        },
    output: {
        filename: fileName('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        // какие расширения вебпаку понимать по умолчанию
        extensions: ['.js', '.jsx', '.json', '.png'],
        // из относительных в абсолютные пути
        alias: {
            '@models': path.resolve(__dirname, 'src/models'),
            '@': path.resolve(__dirname, 'src')
        }
    },
    //запуск dev server
    devServer: {
        port: 3333,
        hot: isDev,
    },
    devtool: isDev ? 'source-map' : false,
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: './index.html',
            //минификация html
            minify: {
                collapseWhitespace: isProd,
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './src/favicon.ico'),
                    to: path.resolve(__dirname, 'dist'),
                }
              ],
        }),
        new MiniCssExtractPlugin({
            filename: fileName('css'),
        }),
        // new ESLintPlugin(
        //     {
        //         context: path.resolve(__dirname, 'src'),
        //         extensions: ['ts', 'tsx', 'js', 'jsx', '.test.tsx', '.stories.tsx'],
        //         overrideConfigFile: path.resolve(__dirname, '.eslintrc.js')
        //     }
        // ),
    ],
    // оптимизация
    optimization: optimization(),
    module: {
        rules: [
            {    // как только вебках встречает в импортах .css ему необходимо использовать следующие лоадеры
                test: /\.css$/,
                // вебпак читает с право на лево
                // use: ['style-loader', 'css-loader'],
                use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        }, 'css-loader'
                    ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                        // Creates `style` nodes from JS strings
                        'style-loader',
                        // Translates CSS into CommonJS
                        'css-loader',
                        // Compiles Sass to CSS
                        'sass-loader',
                ],
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'img/[hash][ext]'
                },
            },
            // для обработки шрифтов
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                // use: ['file-loader'],
                generator: {
                    filename: 'fonts/[hash][ext]'
                },
            },
            // для обработки xml
            {
                test: /\.xml$/,
                use: ['xml-loader'],
            },
            {
                test: /\.csv$/,
                use: ['csv-loader'],
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: jsLoaders(),
            },
            {
                test: /\.m?ts$/,
                // files: ["src/**/*.js"],
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: babelOptions('@babel/preset-typescript')
                }
            },
            {
                test: /\.m?jsx$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: babelOptions('@babel/preset-react')
                }
            },
        ]
    }
}   