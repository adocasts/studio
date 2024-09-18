import { BaseModel, column, belongsTo, BelongsTo } from "@ioc:Adonis/Lucid/Orm"
import { DateTime } from "luxon"
import Discussion from "./Discussion"
import User from "./User"

export default class DiscussionVote extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare discussionId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Discussion)
  declare discussion: BelongsTo<typeof Discussion>
}
