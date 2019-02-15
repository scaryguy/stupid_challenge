const { init: initShuttleDb } = require('./dbs/shuttle')
const createSpaceTravelEmitter = require('./private/space-travel-emitter')
const log = require('./logger')
const shuttleUtil = require('./util/shuttle')
const cadet = require('./cadet')

const listen = async () => {
  const shuttleDb = initShuttleDb()
  // console.log("shuttleDb", await shuttleDb);

  const spaceTravelEmitter = createSpaceTravelEmitter()
  let totalCrewCount = 0

  spaceTravelEmitter.on('space-request', evt => {
    log('space-request', evt)
    ++totalCrewCount
    onSpaceTravelRequested({ shuttleDb, ...evt })
  })

  spaceTravelEmitter.on('end', async evt => {
    shuttleUtil.validateShuttles({
      shuttleMap: (await shuttleDb).read(),
      crewCount: totalCrewCount
    })
    log(
      [
        'no more space requests, exiting.',
        `db can be viewed: ${shuttleDb.getDbFilename()}`
      ].join(' ')
    )
  })
}

const onSpaceTravelRequested = async ({ shuttleDb, cosmonautId }) => {
  const shuttles = (await shuttleDb).read()
  const resolvedShuttles = await shuttles
  // console.log("resolvedShuttles", resolvedShuttles);

  const shuttleArray = []
  Object.keys(resolvedShuttles).forEach(key => {
    shuttleArray.push(resolvedShuttles[key])
  })

  // console.log("ALL SHUTTLES", shuttleArray);

  const availableShuttle = shuttleArray.find(
    ({ date, remainingCapacity }) => date >= 0 && remainingCapacity > 0
  )

  if (!availableShuttle) {
    throw new Error(
      `unable to schedule cosmonautId ${cosmonautId}, no shuttles available`
    )
  }

  log(
    `found shuttle for cosmonautId ${cosmonautId}, shuttle ${
      availableShuttle.name
    }`
  )

  // console.log("availableShuttle", availableShuttle);

  --availableShuttle.remainingCapacity
  availableShuttle.crew.push(cosmonautId)
  ;(await shuttleDb).write(availableShuttle.name, availableShuttle)
  await cadet.logWelcomeLetter({ cosmonautId, shuttle: availableShuttle })
}

module.exports = {
  listen
}
