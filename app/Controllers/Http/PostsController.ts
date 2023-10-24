import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import State from 'App/Enums/States'
import Post from 'App/Models/Post'
import PostStoreValidator from 'App/Validators/PostStoreValidator'
import Route from '@ioc:Adonis/Core/Route'
import DateService from 'App/Services/DateService'
import PostService from 'App/Services/PostService'
import TaxonomyService from 'App/Services/TaxonomyService'
import History from 'App/Models/History'
import PostType from 'App/Enums/PostType'
import Asset from 'App/Models/Asset'
import CacheService from 'App/Services/CacheService'
import AssetService from 'App/Services/AssetService'
import AssetTypes from 'App/Enums/AssetTypes'
import Database from '@ioc:Adonis/Lucid/Database'
import DiscordLogger from '@ioc:Logger/Discord'

export default class PostsController {

  public async index({ request, view, auth, bouncer, params }: HttpContextContract) {
    await bouncer.with('PostPolicy').authorize('viewList')

    const { pattern } = request.qs()
    const page = request.input('page', 1)
    const posts = await auth.user!.related('posts').query()
      .if(params.postTypeId, query => query.where('postTypeId', params.postTypeId))
      .if(pattern, query => query.where('title', 'ILIKE', `%${pattern}%`))
      .preload('authors')
      .orderBy('publishAt', 'desc')
      .paginate(page, 100)

    posts.baseUrl(Route.makeUrl('studio.posts.index', { postTypeId: params.postTypeId }))

    let heading = 'Posts'
    switch (params.postTypeId) {
      case PostType.LESSON:
        heading = 'Lessons'
        break;
      case PostType.NEWS:
        heading = 'News'
        break;
      case PostType.LIVESTREAM:
        heading = 'Livestreams'
        break;
    }

    return view.render('studio/posts/index', { posts, heading, postTypeId: params.postTypeId })
  }

  public async create({ view, bouncer, auth }: HttpContextContract) {
    await bouncer.with('PostPolicy').authorize('store')

    const assets = await Asset.query()
      .whereIn('assetTypeId', [AssetTypes.THUMBNAIL, AssetTypes.COVER])
      .where('filename', 'LIKE', `${auth.user!.id}/%`)
      .orderBy('createdAt', 'desc')

    const postTypes = PostType
    const taxonomies = await TaxonomyService.getAllForTree()

    return view.render('studio/posts/createOrEdit', { assets, taxonomies, postTypes })
  }

  public async store ({ request, response, auth, bouncer }: HttpContextContract) {
    await bouncer.with('PostPolicy').authorize('store')

    const { 
      publishAtDate, 
      publishAtTime, 
      assetIds, 
      assetTypeIds, 
      altTexts,
      credits,
      libraryAssetId, 
      taxonomyIds, 
      ...data 
    } = await request.validate(PostStoreValidator)

    if (!data.stateId) data.stateId = State.PUBLIC

    const publishAt = DateService.getPublishAtDateTime(publishAtDate, publishAtTime, data.timezone)
    const syncAssetIds = libraryAssetId ? [...(assetIds || []), libraryAssetId] : assetIds
    const post = await Post.create({ ...data, publishAt })

    await auth.user!.related('posts').attach([post.id])
    await AssetService.syncAssetTypes(assetIds, assetTypeIds, altTexts, credits)
    await PostService.syncAssets(post, syncAssetIds)
    await PostService.syncTaxonomies(post, taxonomyIds)
    await CacheService.clearForPost(post.id)

    return response.redirect().toRoute('studio.posts.index')
  }

  public async show ({}: HttpContextContract) {
  }

  public async edit ({ view, params, bouncer, auth }: HttpContextContract) {
    const post = await Post.query()
      .where('id', params.id)
      .preload('assets', query => query.orderBy('sort_order'))
      .preload('taxonomies', q => q.select(['id']))
      .firstOrFail()

    const assets = await Asset.query()
      .whereIn('assetTypeId', [AssetTypes.THUMBNAIL, AssetTypes.COVER])
      .where('filename', 'LIKE', `${auth.user!.id}/%`)
      .orderBy('createdAt', 'desc')

    await bouncer.with('PostPolicy').authorize('update', post)

    const postTypes = PostType
    const taxonomies = await TaxonomyService.getAllForTree()
    
    return view.render('studio/posts/createOrEdit', { post, assets, taxonomies, postTypes })
  }

  public async update ({ request, response, params, bouncer }: HttpContextContract) {
    const post = await Post.findOrFail(params.id)

    await bouncer.with('PostPolicy').authorize('update', post)

    let { 
      publishAtDate, 
      publishAtTime, 
      assetIds, 
      assetTypeIds, 
      altTexts,
      credits,
      libraryAssetId, 
      taxonomyIds, 
      ...data 
    } = await request.validate(PostStoreValidator)
    const publishAt = DateService.getPublishAtDateTime(publishAtDate, publishAtTime, data.timezone)
    const syncAssetIds = libraryAssetId ? [...(assetIds || []), libraryAssetId] : assetIds

    post.merge({ ...data, publishAt })

    if (!data.videoBunnyId) post.videoBunnyId = null
    if (!data.videoUrl) post.videoUrl = null
    if (!data.videoBunnyId && !data.videoUrl) post.videoSeconds = 0

    await post.save()
    await AssetService.syncAssetTypes(assetIds, assetTypeIds, altTexts, credits)
    await PostService.syncAssets(post, syncAssetIds)
    await PostService.syncTaxonomies(post, taxonomyIds)
    await CacheService.clearForPost(post.id)

    return response.redirect().toRoute('studio.posts.index')
  }

  public async destroy ({ response, params, session, bouncer }: HttpContextContract) {
    const post = await Post.findOrFail(params.id)
    const trx = await Database.transaction()

    post.useTransaction(trx)

    try {
      await bouncer.with('PostPolicy').authorize('destroy', post)

      await post.related('authors').detach()
      
      const comments = await post.related('comments').query()
      const commentIds = comments.map(c => c.id)
      await trx.from('comment_votes').whereIn('comment_id', commentIds).delete()
      await post.related('comments').query().delete()

      await PostService.destroyAssets(post)
      await History.query().where('postId', params.id).delete()

      await CacheService.clearForPost(post.id)
      await post.delete()

      await trx.commit()
      
      session.flash('success', 'Post has been successfully deleted')
    } catch (error) {
      await trx.rollback()
      session.flash('error', 'Post failed to delete')
      DiscordLogger.error('PostsController.destroy', error.message)
    }
    
    return response.redirect().toRoute('studio.posts.index')
  }

  public async search ({ request, response, bouncer }: HttpContextContract) {
    await bouncer.with('PostPolicy').authorize('store')

    const term = request.input('term', '')
    const limit = request.input('limit', 15)
    const ignoreIds = request.input('ignore', '').split(',').filter(Boolean)

    const posts = await Post.query()
      .if(Array.isArray(ignoreIds), query => query.whereNotIn('id', ignoreIds))
      .where('title', 'ILIKE', `%${term}%`)
      .orderBy('publishAt', 'desc')
      .limit(limit)

    return response.json({ posts })
  }
}
