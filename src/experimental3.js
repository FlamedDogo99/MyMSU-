let exports = {}
let module = {exports: exports}

function getExtensionPublicPath() {
  return 'https://eee-prod-us-east-1-extensions-public-prod.s3.amazonaws.com/001G000000iHmkBIAS/ESG/s_degreeworks_link/1.2.0/'
}

function require(name) {
  const items = {
    "prop-types": (() => window["com.ellucian.shared"].PropTypes)(),
    "@ellucian/react-design-system/core/styles": (() => {
      let styles = window["com.ellucian.shared"].RDSStyles
      styles.withStyles = (_) => ((fn) => {
        const temp1 = window.TEMP
        const imp = fn.propTypes;
        imp.userInfo = {
          dir: "",
          firstName: temp1.user.firstName,
          locale: "",
          roles: [...temp1.user.erpRoles, temp1.user.id, temp1.user.erpId],
          tenantAlias: temp1.tenantAlias,
          tenantId: temp1.tenant
        }
        console.log(fn(imp));
      })
      return styles
    })(),
    "@ellucian/react-design-system/core/styles/tokens": (() => window["com.ellucian.shared"].RDSTokens)(),
    "@ellucian/react-design-system/core": (() => window["com.ellucian.shared"].RDSCore)(),
    "react": (() => {
      const data = window["com.ellucian.shared"].React
      data.createElement = function(tagName, options, children) {
        if(tagName === "button") {
          const element = document.createElement(tagName)
          Object.keys(options.style).forEach(style => {
            element.style[style] = options.style[style];
          })
          if(options.onClick) {
            element.addEventListener("click", function(_) {
              options.onClick();
            }, false)
          }
          element.append(children)
          return [element]
        }
        return children
      }
      return data;
    })()
  };
  if(!items[name]) throw new Error("No import for " + name);
  return items[name];
}

!function(classGenerator, constants) {
  "object" == typeof exports && "object" == typeof module ? module.exports = constants(require("@ellucian/react-design-system/core/styles"), require("@ellucian/react-design-system/core/styles/tokens"), require("@ellucian/react-design-system/core"), require("prop-types"), require("react")) : "function" == typeof define && define.amd ? define(["@ellucian/react-design-system/core/styles", "@ellucian/react-design-system/core/styles/tokens", "@ellucian/react-design-system/core", "prop-types", "react"], constants) : "object" == typeof exports ? exports["ESG Custom"] = constants(require("@ellucian/react-design-system/core/styles"), require("@ellucian/react-design-system/core/styles/tokens"), require("@ellucian/react-design-system/core"), require("prop-types"), require("react")) : classGenerator["ESG Custom"] = constants(classGenerator["@ellucian/react-design-system/core/styles"], classGenerator["@ellucian/react-design-system/core/styles/tokens"], classGenerator["@ellucian/react-design-system/core"], classGenerator["prop-types"], classGenerator.react)
}(self, (classGenerator, constants, RDSCore, PropTypes, React) => ( () => {
    const exportObject = {
      "@ellucian/react-design-system/core": e => {
        "use strict";
        e.exports = RDSCore
      }
      ,
      "@ellucian/react-design-system/core/styles": t => {
        "use strict";
        t.exports = classGenerator
      }
      ,
      "@ellucian/react-design-system/core/styles/tokens": e => {
        "use strict";
        e.exports = constants
      }
      ,
      "prop-types": e => {
        "use strict";
        e.exports = PropTypes
      }
      ,
      "react": e => {
        "use strict";
        e.exports = React
      }
    }
      , exportList = {};

    function getExport(e) {
      var possibleExport = exportList[e];
      if (void 0 !== possibleExport)
        return possibleExport.exports;
      var newExport = exportList[e] = {
        exports: {}
      };
      return exportObject[e](newExport, newExport.exports, getExport),
        newExport.exports
    }
    getExport.get = name => {
      var realName = name && name.__esModule ? () => name.default : () => name;
      return getExport.defineProp(realName, {
        a: realName
      }),
        realName
    }
      ,
      getExport.defineProp = (e, t) => {
        for (var r in t)
          getExport.hasProperty(t, r) && !getExport.hasProperty(e, r) && Object.defineProperty(e, r, {
            enumerable: !0,
            get: t[r]
          })
      }
      ,
      getExport.hasProperty = (self, property) => Object.prototype.hasOwnProperty.call(self, property),
      getExport.publicPath = "";
    var a = {};
    return "function" == typeof getExtensionPublicPath && (getExport.publicPath = getExtensionPublicPath()),
      ( () => {
          "use strict";
          getExport.defineProp(a, {
            default: () => newCard
          });
          var classGenerator = getExport("@ellucian/react-design-system/core/styles")
            , tokens = getExport("@ellucian/react-design-system/core/styles/tokens")
            , RDSCore = getExport("@ellucian/react-design-system/core")
            , PropTypes = getExport("prop-types")
            , propExports = getExport.get(PropTypes)
            , React = getExport("react")
            , reactExports = getExport.get(React)
            , theGoodStuff = function(e) {
            for (var t, classes = e.classes, newLink = "", userRoles = e.userInfo.roles, i = 0; i < userRoles.length; i++)
              /^-\defineProp{8}$/.test(userRoles[i]) && (t = userRoles[i]);
            debugger;
            return newLink = "https://degreeworks.montana.edu:5559/DashboardServlet/",
              newLink += "BZ".toLowerCase() + "_PROD/?SCRIPT=SD2WORKS&PORTALSTUID=" + t,
              reactExports().createElement("div", {
                className: classes.card
              }, reactExports().createElement("button", {
                style: {
                  display: "contents",
                  textAlign: "center",
                  cursor: "pointer"
                },
                onClick: function() {
                  return window.open(newLink, "degreeworkswindow", "noopener,noreferrer"),
                    !1
                }
              }, reactExports().createElement("img", {
                src: "https://objectstorage.us-phoenix-1.oraclecloud.com/n/axtctw9wbjq5/b/experience-images-public/o/bz_DegreeWorks_3.jpeg",
                alt: "Degreeworks",
                style: {
                  maxWidth: "100%"
                }
              })), reactExports().createElement(RDSCore.Typography, null, ["BZ", "HV"].includes("BZ") && reactExports().createElement(reactExports().Fragment, null, "MSU'PropTypes degree planning audit tool that allows students to track progress toward degree. This tool works best in Chrome or Edge. Please use MSU-Secure rather than MSU-Guest if connecting from the campus wireless network."), !1, !1))
          };
          theGoodStuff.propTypes = {
            classes: propExports().object.isRequired,
            userInfo: propExports().object.isRequired
          };
          const newCard = (0,
            classGenerator.withStyles)(function() {
            return {
              card: {
                marginTop: 0,
                marginRight: tokens.spacing40,
                marginBottom: 0,
                marginLeft: tokens.spacing40
              }
            }
          })(theGoodStuff)
        }
      )(),
      a.default
  }
)());