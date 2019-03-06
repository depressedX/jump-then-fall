let HtmlWebpackPlugin = require('html-webpack-plugin');
let path = require('path');
module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, './src/index.html')
        })
    ],
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192
                        }
                    }
                ]
            },
            {
                test: /\.(ttf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]'
                        }
                    }
                ]
            },

            {test: /\.(t|j)sx?$/, use: {loader: 'awesome-typescript-loader'}},
        ]
    },
    resolve: {
        alias: {

            'vue': 'vue/dist/vue.js'
        },

        extensions: [".ts", ".tsx", ".js", ".jsx"]
    }
}