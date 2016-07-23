module.exports = {
   entry: "./lib/andy-ab.js",
   output: {
     path: "./build",
     externals: [{"window.AndyAB": "AndyAB"}],
     filename: "andy-ab.js",
     libraryTarget: "var",
     library: "AndyAB"
   }
};
