import * as core from '@actions/core'
import * as git from './git'
import * as cover from './cover'
import {skip} from './skip'
import {upload} from './upload'
import {summary} from './summary'
import {readStatus} from './status-io'

async function run(): Promise<void> {
  if (await skip()) {
    return
  }

  const status = await readStatus()
  try {
    await git.prepare(status)
    await cover.install(status)
    await cover.activate()
  } catch (error) {
    status.error = error
    if (error instanceof Error) {
      core.setFailed(error.message)
      if (error.stack) {
        core.info(error.stack)
      }
    }
  }

  await upload(status)
  await summary(status)
}

run()
