"use strict";

const Hapi = require("@hapi/hapi");
const { handler } = require("@hapi/inert/lib/file");
const path = require("path");
const init = async () => {
  const server = Hapi.Server({
    host: "localhost",
    port: 1234,
    routes: {
      files: {
        relativeTo: path.join(__dirname, "static"),
      },
    },
  });
  // only hapi plugins will registered within the server
  await server.register([
    {
      plugin: require("hapi-geo-locate"),
      options: {
        enabledByDefault: false,
      },
    },
    {
      plugin: require("@hapi/inert"),
    },
    {
      plugin: require("@hapi/vision"),
    },
  ]);

  server.views({
    engines: {
      html: require("handlebars"),
      //  we can also use
      // hbs in place of html we need to change the file extension as well and then
      // we will serve using the nodemon -e hbs,js server.js
    },
    path: path.join(__dirname, "views"),
    layout: "default",
  });
  server.route([
    {
      method: "GET",
      path: "/",
      handler: (req, res) => {
        return res.file("welcome.html");
      },
    },
    {
      method: "GET",
      path: "/users/{user?}",
      // ? means param is optional
      handler: (req, res) => {
        // return res.redirect("/");
        // req.query.(queryParameterName)
        if (req.params.user) {
          return `<h1>Hello ${req.params.user} has an employee with name ${req.query.name} and last name ${req.query.lastname}</h1>`;
        }
        return `<h1>Hello Stranger</h1>`;
      },
    },
    {
      method: "GET",
      path: "/{any*}",
      handler: () => {
        return "<h1>Page Not Found</h1>";
      },
    },
    {
      method: "GET",
      path: "/download",
      handler: (request, h) => {
        return h.file("welcome.html", {
          mode: "inline",
          // mode: "attachment",
          filename: "Demo.html",
        });
      },
    },
    {
      method: "GET",
      path: "/location",
      handler: (req, res) => {
        if (req.location) {
          return req.location;
        } else {
          return `<h1>Location is enabled by default</h1>`;
        }
      },
    },
    {
      method: "POST",
      path: "/login",
      handler: (request, h) => {
        if (
          request.payload.name === "Ahmed" &&
          request.payload.password === "123"
        ) {
          return h.file("logged-in.html");
        } else {
          return h.file("not-logged-in.html");
        }
      },
    },
    {
      method: "POST",
      path: "/dynamicLogin",
      handler: (request, h) => {
         if (request.payload.name !== "" && request.payload.password) {
          let data = {name:request.payload.name, password:request.payload.password};
          return h.view('index',data)
        } else {
          return "Nothing found";
        }
      },
    },
  ]);

  await server.start();
  console.log(`Server Started on: ${server.info.uri}`);
};

// this on is an event listener
// the unhandledRejection event is emitted when a promise is reject and no error
// handler is attached to the promise within a turn of the event loop
process.on("unhandledRejection", (err) => {
  // process is a global object that give us information about current node process is running
  console.log(err);
  process.exit(1);
});

//  Since this is an async function it will return a promise
init();
