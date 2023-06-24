import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Models/Role'
import Route from '@ioc:Adonis/Core/Route'
import RoleValidator from 'App/Validators/RoleValidator'

export default class RolesController {
  public async index({ view, request, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const page = request.input('page', 1)
    const roles = await Role.query()
      .withCount('users')
      .orderBy('createdAt', 'asc')
      .paginate(page, 100)

    roles.baseUrl(Route.makeUrl('studio.users.roles.index'))

    return view.render('studio/roles/index', { roles })
  }

  public async create({ view, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')
    return view.render('studio/roles/createOrEdit')
  }

  public async store({ request, response, session, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const data = await request.validate(RoleValidator)
    await Role.create(data)

    session.flash('success', 'Role created successfully')

    return response.redirect().toRoute('studio.users.roles.index')
  }

  public async show({ request, view, params, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const page = request.input('page', 1)
    const role = await Role.findOrFail(params.id)
    const users = await role.related('users').query()
      .preload('profile')
      .orderBy('createdAt', 'desc')
      .paginate(page, 100)

    users.baseUrl(Route.makeUrl('studio.users.roles.show', { id: role.id }))

    return view.render('studio/roles/show', { role, users })
  }

  public async edit({ view, params, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const role = await Role.findOrFail(params.id)

    return view.render('studio/roles/createOrEdit', { role })
  }

  public async update({ request, response, session, params, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const data = await request.validate(RoleValidator)
    const role = await Role.findOrFail(params.id)

    await role.merge(data).save()

    session.flash('success', 'Role updated successfully')

    return response.redirect().toRoute('studio.users.roles.index')
  }
}
