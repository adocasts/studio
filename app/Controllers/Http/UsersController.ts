import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Route from '@ioc:Adonis/Core/Route'
import Role from 'App/Models/Role'
import UserRoleValidator from 'App/Validators/UserRoleValidator'

export default class UsersController {
  public async index({ view, request, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('viewUsers')

    const page = request.input('page', 1)
    const users = await User.query()
      .preload('profile')
      .orderBy('createdAt', 'desc')
      .paginate(page, 100)

    users.baseUrl(Route.makeUrl('studio.users.index'))

    return view.render('studio/users/index', { users })
  }

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({ view, params, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('viewUsers')

    const roles = await Role.all()
    const user = await User.findOrFail(params.id)
    const profile = await user.related('profile').query().firstOrFail()

    return view.render('studio/users/show', { roles, user, profile })
  }

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async role({ request, response, params, session, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const data = await request.validate(UserRoleValidator)
    const user = await User.findOrFail(params.id)

    await user.merge(data).save()

    session.flash('success', 'Role updated successfully')

    return response.redirect().toRoute('studio.users.show', { id: params.id })
  }

  public async destroy({}: HttpContextContract) {}
}
