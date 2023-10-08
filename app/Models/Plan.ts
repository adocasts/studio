import { DateTime } from 'luxon'
import { BaseModel, HasMany, column, computed, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Env from '@ioc:Adonis/Core/Env'
import User from './User'

export default class Plan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public slug: string

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public stripePriceId: string | null

  @column()
  public stripePriceTestId: string | null

  @column()
  public price: number

  @column()
  public isActive: true

  @column()
  public couponCode: string | null

  @column()
  public couponDiscountFixed: number | null

  @column()
  public couponDiscountPercent: number | null

  @column()
  public couponDurationId: number | null

  @column()
  public stripeCouponId: string | null

  @column.dateTime()
  public couponStartAt: DateTime | null

  @column.dateTime()
  public couponEndAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get mode() {
    if (Env.get('NODE_ENV') === 'production') {
      return 'live'
    }

    return 'testing'
  }

  @computed()
  public get priceId() {
    if (Env.get('NODE_ENV') === 'production') {
      return this.stripePriceId
    }

    return this.stripePriceTestId
  }

  @computed()
  public get hasActiveSale() {
    if (!this.couponCode) return false
    const isStartInRange = !this.couponStartAt || this.couponStartAt <= DateTime.now()
    const isEndInRange = !this.couponEndAt || this.couponEndAt >= DateTime.now()
    return isStartInRange && isEndInRange && (this.couponDiscountFixed || this.couponDiscountPercent)
  }

  @computed()
  public get salePrice() {
    if (!this.hasActiveSale) return this.price

    if (this.couponDiscountFixed) {
      return this.price - this.couponDiscountFixed
    } else if (this.couponDiscountPercent) {
      return this.price - (this.price * (this.couponDiscountPercent / 100))
    }

    return this.price
  }

  @hasMany(() => User)
  public users: HasMany<typeof User>
}
