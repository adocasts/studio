import { HttpContext } from '@adonisjs/core/build/standalone'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class AppProvider {
  constructor (protected app: ApplicationContract) {}

  public register () {
    // Register your own bindings
  }

  public async boot () {
    // IoC container is ready
    const { BaseModel } = this.app.container.resolveBinding('Adonis/Lucid/Orm')
    const boot = BaseModel.boot

    BaseModel.boot = function() {
      if (this.booted) return

      boot.call(this)

      this.before('create', (item) => {
        const ctx = HttpContext.getOrFail()
        ctx.logger.debug(`[BEFORE] User ${ctx.auth.user?.id} is creating ${item.constructor.name}`)
      })

      this.after('create', (item) => {
        const ctx = HttpContext.getOrFail()
        ctx.logger.debug(`[AFTER] User ${ctx.auth.user?.id} has created ${item.constructor.name} ${item.id}`)
      })

      this.before('update', (item) => {
        const ctx = HttpContext.getOrFail()
        ctx.logger.debug(`[BEFORE] User ${ctx.auth.user?.id} is updating ${item.constructor.name} ${item.id}`)
      })

      this.after('update', (item) => {
        const ctx = HttpContext.getOrFail()
        ctx.logger.debug(`[AFTER] User ${ctx.auth.user?.id} has updated ${item.constructor.name} ${item.id}`)
      })

      this.before('delete', (item) => {
        const ctx = HttpContext.getOrFail()
        ctx.logger.debug(`[BEFORE] User ${ctx.auth.user?.id} is deleting ${item.constructor.name} ${item.id}`)
      })

      this.after('delete', (item) => {
        const ctx = HttpContext.getOrFail()
        ctx.logger.debug(`[AFTER] User ${ctx.auth.user?.id} has deleted ${item.constructor.name} ${item.id}`)
      })
    }
  }

  public async ready () {
    // App is ready
  }

  public async shutdown () {
    // Cleanup, since app is going down
  }
}
