import Redis from '@ioc:Adonis/Addons/Redis'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Collection from 'App/Models/Collection'
import Post from 'App/Models/Post'
import Taxonomy from 'App/Models/Taxonomy'

export default class DashboardController {
  public async index({ view }: HttpContextContract) {
    const postCount = await Post.query().apply(s => s.published()).getCount()
    const postSeconds = await Post.query().sum('video_seconds').first()
    const seriesCount = await Collection.series().wherePublic().whereNull('parentId').getCount()
    const topicCount = await Taxonomy.query().getCount()

    return view.render('studio/index', { postCount, postSeconds, seriesCount, topicCount })
  }

  public async clearBentoCache({ response, session }: HttpContextContract) {
    const keys = await Redis.keys('bentocache:*')
    
    await Redis.del(keys)

    session.flash('success', 'Bentocache items have been cleared')
    
    return response.redirect().back()
  }
}
