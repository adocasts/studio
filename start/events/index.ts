import { HttpContext } from '@adonisjs/core/build/standalone'
import Event from '@ioc:Adonis/Core/Event'
import Database from '@ioc:Adonis/Lucid/Database'
import './auth'

// Event.on('db:query', Database.prettyPrint)

Event.on('db:query', ({ sql, bindings }) => {
  const ctx = HttpContext.getOrFail()
  console.log({ 
    userId: ctx.auth.user?.id,
    sql,
    bindings
  })
})