var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
module.exports = {
    mode:'development',
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 80
    },
    plugins: [
        new HtmlWebpackPlugin({
            template:path.resolve(__dirname,'./src/index.html')
        })
    ]
}