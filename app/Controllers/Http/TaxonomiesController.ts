import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Taxonomy from "App/Models/Taxonomy";
import TaxonomyValidator from "App/Validators/TaxonomyValidator";
import TaxonomyService from 'App/Services/TaxonomyService'
import CacheService from 'App/Services/CacheService'
import AssetService from 'App/Services/AssetService';

export default class TaxonomiesController {
  public async index({ view, bouncer }: HttpContextContract) {
    await bouncer.with('TaxonomyPolicy').authorize('viewList')

    const taxonomies = await Taxonomy.query()
      .withCount('posts')
      .withCount('collections')

    return view.render('studio/taxonomies/index', { taxonomies })
  }

  public async create({ view, request, bouncer }: HttpContextContract) {
    await bouncer.with('TaxonomyPolicy').authorize('create')

    const { rootParentId, parentId } = request.qs()
    const parent = parentId ? await Taxonomy.findOrFail(parentId) : null

    return view.render('studio/taxonomies/createOrEdit', {
      rootParentId,
      parentId,
      parent
    })
  }

  public async store({ request, response, bouncer }: HttpContextContract) {
    await bouncer.with('TaxonomyPolicy').authorize('create')

    const { postIds, ...data } = await request.validate(TaxonomyValidator)

    const taxonomy = await Taxonomy.create(data)

    await TaxonomyService.syncPosts(taxonomy, postIds)

    return response.redirect().toRoute('studio.taxonomies.index')
  }

  public async show({}: HttpContextContract) {}

  public async edit({ view, params, bouncer }: HttpContextContract) {
    const taxonomy = await Taxonomy.findOrFail(params.id)
    
    await bouncer.with('TaxonomyPolicy').authorize('update', taxonomy)

    await taxonomy.load('asset')
    await taxonomy.load('posts', query => query.orderBy('pivot_sort_order'))

    return view.render('studio/taxonomies/createOrEdit', { taxonomy })
  }

  public async update({ request, response, params, bouncer }: HttpContextContract) {
    const taxonomy = await Taxonomy.findOrFail(params.id)

    await bouncer.with('TaxonomyPolicy').authorize('update', taxonomy)

    const { postIds, assetTypeIds, altTexts, credits, ...data } = await request.validate(TaxonomyValidator)

    if (data.assetId) {
      await AssetService.syncAssetTypes([data.assetId], assetTypeIds, altTexts, credits)
    }

    await taxonomy.merge(data).save()
    await TaxonomyService.syncPosts(taxonomy, postIds)
    await CacheService.clearForTaxonomy(taxonomy.slug)

    return response.redirect().toRoute('studio.taxonomies.index')
  }

  public async destroy({ response, params, bouncer }: HttpContextContract) {
    const taxonomy = await Taxonomy.findOrFail(params.id)

    await bouncer.with('TaxonomyPolicy').authorize('delete', taxonomy)

    const flatChildren = await TaxonomyService.getFlatChildren(taxonomy.id)
    const flatChildrenIds = flatChildren.reverse().map(c => c.id)

    await Taxonomy.query().whereIn('id', flatChildrenIds).delete()
    await taxonomy.delete()
    await CacheService.clearForTaxonomy(taxonomy.slug)

    return response.redirect().toRoute('studio.taxonomies.index')
  }
}
