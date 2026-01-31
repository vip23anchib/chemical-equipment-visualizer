const path = require('path');

module.exports = {
    style: {
        postcss: {
            mode: 'extends',
            loaderOptions: (postcssLoaderOptions) => {
                postcssLoaderOptions.postcssOptions = {
                    plugins: [
                        require('tailwindcss')(path.resolve(__dirname, 'tailwind.config.js')),
                        require('autoprefixer'),
                    ],
                };
                return postcssLoaderOptions;
            },
        },
    },
};
