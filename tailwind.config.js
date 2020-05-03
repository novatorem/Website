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
        instagram: "#121212",
        linkedin: "#121212",
        github: "#121212",
        facebook: "#121212",
        google: "#DB4437",
      },
    },
  },
};
