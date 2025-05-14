module.exports = {
    content: [
      './app/helpers/**/*.rb',
      './app/javascript/**/*.js',
      './app/views/**/*.{erb,haml,html,slim}',
      './app/assets/stylesheets/**/*.css',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        },
      },
    },
    plugins: [
      // Add any plugins you're using here
    ],
  }