import { exportVersionsAsJson } from './registry'

process.stdout.write(exportVersionsAsJson() + '\n')
