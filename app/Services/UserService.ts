import RoleEnum, { RoleWeights} from 'App/Enums/Roles'
import Role from 'App/Models/Role'
import Event from '@ioc:Adonis/Core/Event'

export default class UserService {
  public static async sendRoleUpdateNotification(user: User, newRole: Role, oldRole: Role) {
    const oldRoleWeight = RoleWeights.findIndex(id => id === oldRole.id)
    const newRoleWeight = RoleWeights.findIndex(id => id === newRole.id)
console.log({ oldRoleWeight, newRoleWeight })
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
}