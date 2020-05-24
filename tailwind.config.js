const { colors } = require("tailwindcss/defaultTheme");

module.exports = {
  purge: {
    enabled: false,
  },
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: colors.teal,
        google: "#DB4437",
      },
    },
  },
};
