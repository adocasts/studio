import { schema, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CouponValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    couponCode: schema.string.optional([rules.maxLength(100)]),
    couponDiscountFixed: schema.number.optional([rules.range(0, 999)]),
    couponDiscountPercent: schema.number.optional([rules.range(0, 99)]),
    couponStartAt: schema.date.optional({ format: 'yyyy-MM-dd' }),
    couponEndAt: schema.date.optional({ format: 'yyyy-MM-dd' }),
    couponDurationId: schema.number.optional(),
    stripeCouponId: schema.string.optional(),
    planIds: schema.array().members(schema.number([rules.exists({ table: 'plans', column: 'id' })])),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages = {}
}
