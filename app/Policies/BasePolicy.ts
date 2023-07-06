import { BasePolicy as BouncerBasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import User from 'App/Models/User'
import Role from 'App/Enums/Roles'

export default class BasePolicy extends BouncerBasePolicy {
	protected isAdmin(user: User | null) {
		return user?.roleId === Role.ADMIN
	}

	protected canContribute(user: User | null) {
		return this.isAdmin(user) || user?.roleId === Role.CONTRIBUTOR
	}

	protected isAuthenticated(user: User | null) {
		return !!user
	}
}