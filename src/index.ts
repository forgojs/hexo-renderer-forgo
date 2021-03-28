import * as forgo from "forgo";
import renderToString from "forgo-ssr";

const startTag = "<html";
const babelOptions = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    [
      "@babel/plugin-transform-react-jsx",
      {
        throwIfNamespace: false,
        runtime: "automatic",
        importSource: "forgo",
      },
    ],
  ],
};

require("@babel/register")(babelOptions);

function compile(data: any) {
  const Component = require(data.path);

  return function (locals: any) {
    const element = forgo.createElement(Component, locals);

    // test if the layout is root layout file so we can skip costly large string comparison
    if ("layout" in locals && "view_dir" in locals && "filename" in locals) {
      if (
        locals.filename.startsWith(locals.view_dir) &&
        locals.layout === false
      ) {
        // this is root layout file, add doctype
        return "<!doctype html>\n" + renderToString(element);
      }
      return renderToString(element);
    }
    const markup = renderToString(element);
    // do not use substr, substring, slice to prevent string copy
    for (let i = 0; i < 5; i++) {
      if (markup.charAt(i).toLowerCase() !== startTag.charAt(i)) {
        return markup;
      }
    }
    return "<!doctype html>\n" + markup;
  };
}

module.exports = compile;
