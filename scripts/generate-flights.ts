import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildMockFlightCatalog, MOCK_FLIGHT_COUNT } from '../lib/mock/flightGenerator'

const flights = buildMockFlightCatalog()
const outputPath = resolve(process.cwd(), 'data/flights.json')

writeFileSync(outputPath, `${JSON.stringify(flights, null, 2)}\n`)
console.log(`Generated ${flights.length} flights (target ${MOCK_FLIGHT_COUNT}) -> ${outputPath}`)
