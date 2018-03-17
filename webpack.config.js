var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
module.exports = {
    mode:'development',
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 80,
        host:'0.0.0.0'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template:path.resolve(__dirname,'./src/index.html')
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
                            name:'[name].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        alias: {

            'vue':'vue/dist/vue.min.js'
        }
    }
}