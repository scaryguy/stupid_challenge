const fs = require('fs-extra')
const path = require('path')
const bluebird = require('bluebird')
const log = require('./logger')

const TRY_FILENAMES = ['template', 'template/welcome-cadet.md'].map(basename =>
  path.resolve(__dirname, basename)
)

// console.log("fiLE NAMESSS", TRY_FILENAMES);

function logWelcomeLetter ({ cosmonautId, shuttle }) {
  bluebird
    .filter(TRY_FILENAMES, filename =>
      fs
        .lstat(filename)
        .then(stat => stat.isFile && !stat.isDirectory)
        .then(result => result)
    )
    .then(filenames => {
      // take the first file, assume it's the desired template
      // console.log("FILENAMES", filenames);

      const templateFilename =
        filenames.length > 1 ? filenames[0] : TRY_FILENAMES[1]
      log(`selected cadet welcome template file: ${templateFilename}`)
      return fs.readFile(templateFilename).then(content => {
        console.log(
          content
            .toString()
            .replace('{cosmonautId}', cosmonautId)
            .replace('{days}', shuttle.date)
            .replace('{shuttleName}', shuttle.name)
        )
      })
    })
    .catch(e => {
      console.log(e)

      throw new Error(`failed to log cosmonaut ${cosmonautId} welcome letter`)
    })
}

module.exports = {
  logWelcomeLetter
}
