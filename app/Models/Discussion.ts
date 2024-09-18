import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column, computed, hasMany, HasMany, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from 'App/Models/AppBaseModel'
import DiscussionViewTypes from 'App/Enums/DiscussionViewTypes'
import User from './User'
import DiscussionView from './DiscussionView'
import Taxonomy from './Taxonomy'
import Comment from './Comment'

export default class Discussion extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare taxonomyId: number

  @column()
  declare stateId: number

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare body: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  get createdAtDisplay() {
    if (!this.createdAt) return ''

    if (DateTime.now().year === this.createdAt.year) {
      return this.createdAt.toFormat('MMM dd')
    }

    return this.createdAt.toFormat('MMM dd, yy')
  }

  @computed()
  get updatedAtDisplay() {
    if (!this.updatedAt) return ''

    if (DateTime.now().year === this.updatedAt.year) {
      return this.updatedAt.toFormat('MMM dd')
    }

    return this.updatedAt.toFormat('MMM dd, yy')
  }

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Taxonomy)
  declare taxonomy: BelongsTo<typeof Taxonomy>

  @hasMany(() => Comment)
  declare comments: HasMany<typeof Comment>

  @hasMany(() => DiscussionView, {
    onQuery(query) {
      query.where('typeId', DiscussionViewTypes.VIEW)
    }
  })
  declare views: HasMany<typeof DiscussionView>

  @hasMany(() => DiscussionView)
  declare impressions: HasMany<typeof DiscussionView>

  @manyToMany(() => User, {
    pivotTable: 'discussion_votes'
  })
  declare votes: ManyToMany<typeof User>
}
