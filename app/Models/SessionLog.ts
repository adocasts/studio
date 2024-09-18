import { DateTime } from 'luxon'
import { BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from 'App/Models/AppBaseModel'
import User from './User'

export default class SessionLog extends AppBaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare token: string

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare browserName: string | null

  @column()
  declare browserEngine: string | null

  @column()
  declare browserVersion: string | null

  @column()
  declare deviceModel: string | null

  @column()
  declare deviceType: string | null

  @column()
  declare deviceVendor: string | null

  @column()
  declare osName: string | null

  @column()
  declare osVersion: string | null

  @column()
  declare city: string | null

  @column()
  declare country: string | null

  @column()
  declare countryCode: string | null

  @column.dateTime()
  declare lastTouchedAt: DateTime | null

  @column.dateTime()
  declare loginAt: DateTime | null

  @column()
  declare loginSuccessful: boolean

  @column.dateTime()
  declare logoutAt: DateTime | null

  @column()
  declare forceLogout: boolean

  @column()
  declare isRememberSession: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  isCurrentSession: boolean = false
}
