import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '2vnlh9ne',
    dataset: 'production'
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */

  studioHost: 'myprojectblog',
  autoUpdates: true,
})
