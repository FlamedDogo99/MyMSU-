import * as fileTools from "./file-tools.js"
import open from "open"
// const open = require('open')

const urlRegex = /url\(.*?\)/ig
const quotedStringRegex = /".*?"/

const absolutePath = "https://cdn.elluciancloud.com/assets/EDS2/7.18.1"

fileTools.getFile("tools/getUrls.txt")
  .then(text => {
    text.match(urlRegex).forEach(urlString => {
      const matches = urlString.match(quotedStringRegex)
      if(matches.length === 0) return;
      const url = absolutePath + matches[0].slice(2).slice(0, -1)
      open(url, {wait: true})
        .catch(reason => {
          throw new Error("Unable to open url " + url + ". " + reason);
        })

    })
  })


