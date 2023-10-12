import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CollectionType from 'App/Enums/CollectionTypes'
import State from 'App/Enums/States'
import Status from 'App/Enums/Status'
import Collection from 'App/Models/Collection'
import CollectionValidator from 'App/Validators/CollectionValidator'
import Route from '@ioc:Adonis/Core/Route'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import CollectionService from 'App/Services/CollectionService'
import TaxonomyService from 'App/Services/TaxonomyService'

export default class CollectionsController {
  public async index ({ view, request, bouncer }: HttpContextContract) {
    await bouncer.with('CollectionPolicy').authorize('viewList')

    const page = request.input('page', 1)
    const collections = await Collection.query()
      .preload('children', query => query.withCount('posts').select('id'))
      .withCount('posts')
      .whereNull('parentId')
      .orderBy('createdAt', 'desc')
      .paginate(page, 100)

    const collectionCounts = {}
    collections.map(collection => {
      const subPosts = collection.children.reduce((count, child) => count + Number(child.$extras.posts_count), 0)
      collectionCounts[collection.id] = Number(collection.$extras.posts_count) + subPosts
    })

    collections.baseUrl(Route.makeUrl('studio.collections.index'))

    return view.render('studio/collections/index', { collections, collectionCounts })
  }

  public async create ({ view, bouncer }: HttpContextContract) {
    await bouncer.with('CollectionPolicy').authorize('create')

    const states = State
    const statuses = Status
    const collectionTypes = CollectionType
    const taxonomies = await TaxonomyService.getAllForTree()
    const collections = await Collection.query().whereNull('parentId').select('id', 'name').orderBy('name')

    return view.render('studio/collections/createOrEdit', { states, statuses, collectionTypes, taxonomies, collections })
  }

  public async store ({ request, response, session, auth, bouncer }: HttpContextContract) {
    await bouncer.with('CollectionPolicy').authorize('create')
    
    let collection = await Collection.firstOrNewById(undefined)
    
    const data = await request.validate(CollectionValidator)
    
    collection = await CollectionService.updateOrCreate(collection, { ...data, ownerId: auth.user!.id }, true)

    session.flash('success', "Your collection has been created")

    return response.redirect().toRoute('studio.collections.edit', { id: collection.id })
  }

  public async stub ({ request, response, auth, bouncer }: HttpContextContract) {
    await bouncer.with('CollectionPolicy').authorize('create')
    
    const data = await request.validate({
      schema: schema.create({
        parentId: schema.number([rules.exists({ table: 'collections', column: 'id' })])
      })
    })

    const collection = await CollectionService.stub(auth.user!.id, data)

    return response.json({ collection })
  }

  public async show ({}: HttpContextContract) {
  }

  public async edit ({ view, params, bouncer }: HttpContextContract) {
    const collection = await Collection.findOrFail(params.id)

    await bouncer.with('CollectionPolicy').authorize('update', collection)

    const states = State
    const statuses = Status
    const collectionTypes = CollectionType

    await collection.load('asset')
    await collection.load('posts', query => query.orderBy('pivot_sort_order'))
    await collection.load('taxonomies', q => q.select(['id']))

    const children = await Collection.query()
      .where('parentId', collection.id)
      .preload('posts', query => query.orderBy('pivot_sort_order'))

    const collections = await Collection.query()
      .whereNull('parentId')
      .whereNot('id', collection.id)
      .select('id', 'name')
      .orderBy('name')

    const taxonomies = await TaxonomyService.getAllForTree()

    return view.render('studio/collections/createOrEdit', { collection, collections, children, states, statuses, collectionTypes, taxonomies })
  }

  public async update ({ request, response, params, bouncer }: HttpContextContract) {
    const collection = await Collection.firstOrNewById(params.id)

    await bouncer.with('CollectionPolicy').authorize('update', collection)

    const data = await request.validate(CollectionValidator)
    const isOwner = await bouncer.with('CollectionPolicy').allows('isOwner', collection)

    await CollectionService.updateOrCreate(collection, data, isOwner)

    return response.redirect().toRoute('studio.collections.index')
  }

  public async destroy ({ request, response, params, bouncer }: HttpContextContract) {
    const _collection = await Collection.findOrFail(params.id)

    await bouncer.with('CollectionPolicy').authorize('delete', _collection)

    const collection = await CollectionService.delete(params.id)

    if (request.headers()['content-type']?.includes('application/json')) {
      return response.json({ success: true, collection })
    }

    return response.redirect().toRoute('studio.collections.index')
  }
}
