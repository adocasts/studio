import RoleEnum, { RoleWeights} from 'App/Enums/Roles'
import Role from 'App/Models/Role'
import Event from '@ioc:Adonis/Core/Event'
import User from 'App/Models/User'
import Database from '@ioc:Adonis/Lucid/Database'
import DiscussionView from 'App/Models/DiscussionView'
import DiscordLogger from '@ioc:Logger/Discord'
import States from 'App/Enums/States'

export default class UserService {
  public static async sendRoleUpdateNotification(user: User, newRole: Role, oldRole: Role) {
    const oldRoleWeight = RoleWeights.findIndex((id) => id === oldRole.id)
    const newRoleWeight = RoleWeights.findIndex((id) => id === newRole.id)

    if (oldRoleWeight >= newRoleWeight) return

    switch (newRole.id) {
      case RoleEnum.CONTRIBUTOR_LVL_1:
        return Event.emit('role:upgrade:contributor_lvl_1', { user, newRole, oldRole })
      case RoleEnum.CONTRIBUTOR_LVL_2:
        return Event.emit('role:upgrade:contributor_lvl_2', { user, newRole, oldRole })
      case RoleEnum.ADMIN:
        return Event.emit('role:upgrade:admin', { user, newRole, oldRole })
    }
  }

  /**
   * delete user's account and associated data
   * @param user
   */
  static async destroy(user: User) {
    const trx = await Database.transaction()

    user.useTransaction(trx)

    try {
      // purge data
      await user.related('histories').query().delete()
      await user.related('progresses').query().delete()
      await user.related('watchlist').query().delete()
      await user.related('notifications').query().delete()
      await user.related('initiatedNotifications').query().delete()
      await user.related('emailHistory').query().delete()
      await user.related('commentVotes').query().update({ userId: null })
      await user.related('invoices').query().delete()
      await user.related('sessions').query().delete()

      await DiscussionView.query({ client: trx }).where('userId', user.id).update({ userId: null })

      await this.destroyComments(user)
      await this.destroyLessonRequests(user)
      await this.destroyDiscussions(user)

      // purge profile
      await user.related('profile').query().delete()

      // purge account
      await user.delete()

      await trx.commit()

      return true
    } catch (error) {
      await DiscordLogger.error(`Failed to delete user id: ${user.id}`, error.message)
      await trx.rollback()
      return false
    }
  }

  /**
   * delete or disassociate user's comments
   * @param user
   */
  static async destroyComments(user: User) {
    const comments = await user
      .related('comments')
      .query()
      .withCount('responses', (q) => q.where('stateId', States.PUBLIC))

    for (const comment of comments) {
      if (comment.$extras.responses_count === '0') {
        await comment.delete()
        continue
      }

      comment.stateId = States.ARCHIVED
      comment.userId = null
      comment.body = '[deleted]'
      await comment.save()
    }
  }

  /**
   * delete user's lesson requests & lesson request votes
   * @param user
   */
  static async destroyLessonRequests(user: User) {
    const requests = await user.related('lessonRequests').query()

    await user.related('lessonRequestVotes').query().delete()

    for (const request of requests) {
      await request.related('comments').query().delete()
      await request.related('votes').query().delete()
      await request.delete()
    }
  }

  static async destroyDiscussions(user: User) {
    const discussions = await user.related('discussions').query()

    await user.related('discussionVotes').query().update({ userId: null })

    for (const discussion of discussions) {
      await discussion.related('comments').query().delete()
      await discussion.related('votes').query().delete()
      await discussion.delete()
    }
  }
}
