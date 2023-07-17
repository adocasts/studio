import BasePolicy from './BasePolicy'
import User from 'App/Models/User'
import Collection from 'App/Models/Collection'

export default class CollectionPolicy extends BasePolicy {
	public async before(user: User) {
		if (this.isAdmin(user)) {
			return true
		}
	}
	
	public async viewList(user: User) {
		return this.isLvl2Contributor(user)
	}
	
	public async view(user: User, _collection: Collection) {
		return this.isLvl2Contributor(user)
	}

	public async feature(_user: User) {
		return false
	}
	
	public async create(user: User) {
		return this.isLvl2Contributor(user)
	}
	
	public async update(user: User, _collection: Collection) {
		return this.isLvl2Contributor(user)
	}
	
	public async delete(user: User, collection: Collection) {
		return this.isOwner(user, collection)
	}

	public async isOwner(user: User, collection: Collection) {
		if (!collection) return this.isLvl2Contributor(user)
		return collection.ownerId === user.id
  }
}
