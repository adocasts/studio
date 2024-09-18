import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Plan from 'App/Models/Plan'
import Route from '@ioc:Adonis/Core/Route'
import CouponValidator from 'App/Validators/CouponValidator'
import Plans from 'App/Enums/Plans'
import StripeSubscriptionStatuses from 'App/Enums/StripeSubscriptionStatuses'

export default class PlansController {
  public async index({ view, request, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const page = request.input('page', 1)
    const plans = await Plan.query()
      .withCount('users', (query) =>
        query.where((query) => {
          query
            .where('planId', Plans.FOREVER)
            .orWhere('planId', Plans.FREE)
            .orWhere('stripeSubscriptionStatus', StripeSubscriptionStatuses.ACTIVE)
            .orWhere('stripeSubscriptionStatus', StripeSubscriptionStatuses.COMPLETE)
        })
      )
      .orderBy('createdAt', 'desc')
      .paginate(page, 30)

    plans.baseUrl(Route.makeUrl('studio.plans.index'))

    return view.render('studio/plans/index', { plans })
  }

  public async coupon({ view, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const plans = await Plan.query()
      .where('price', '!=', 0)
      .where('isActive', true)
      .orderBy('name', 'asc')

    return view.render('studio/plans/coupon', { plans })
  }

  public async couponUpdate({ request, response, session, bouncer }: HttpContextContract) {
    await bouncer.with('StudioPolicy').authorize('adminOnly')

    const { planIds, ...data } = await request.validate(CouponValidator)
    await Plan.query().whereIn('id', planIds).update(data)

    session.flash('success', 'Coupon was successfully updated for selected plans')

    return response.redirect().toRoute('studio.plans.index')
  }

  public async create({}: HttpContextContract) {}

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
