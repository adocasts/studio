import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import InvoiceStoreValidator from 'App/Validators/InvoiceStoreValidator'
import { DateTime } from 'luxon'

export default class InvoicesController {
  public async index({}: HttpContextContract) {}

  public async create({}: HttpContextContract) {}

  public async store({ request, response, params }: HttpContextContract) {
    const { periodStartAt, periodEndAt, ...data } = await request.validate(InvoiceStoreValidator)
    const user = await User.findOrFail(params.id)

    await user.related('invoices').create({
      ...data,
      paid: true,
      periodStartAt: periodStartAt ? DateTime.fromSeconds(periodStartAt) : undefined,
      periodEndAt: periodEndAt ? DateTime.fromSeconds(periodEndAt) : undefined
    })

    return response.redirect().back()
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
