import BasePolicy from 'App/Policies/BasePolicy'
import User from 'App/Models/User'
import Taxonomy from 'App/Models/Taxonomy'

export default class TaxonomyPolicy extends BasePolicy {
	public async before(user: User) {
		if (this.isAdmin(user)) {
			return true
		}
	}
	
	public async viewList(user: User) {
		return this.canContribute(user)
	}
	
	public async view(user: User, _taxonomy: Taxonomy) {
		return this.canContribute(user)
	}

	public async feature(_user: User) {
		return false
	}
	
	public async create(user: User) {
		return this.canContribute(user)
	}
	
	public async update(user: User, _taxonomy: Taxonomy) {
		return this.canContribute(user)
	}
	
	public async delete(user: User, taxonomy: Taxonomy) {
		return this.isOwner(user, taxonomy)
	}

	public async isOwner(user: User, taxonomy: Taxonomy) {
		if (!taxonomy) return this.canContribute(user)
		return taxonomy.ownerId === user.id
  }
}
