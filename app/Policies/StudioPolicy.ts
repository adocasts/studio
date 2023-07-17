import BasePolicy from 'App/Policies/BasePolicy'
import User from 'App/Models/User'

export default class StudioPolicy extends BasePolicy {
	public async before(user: User | null) {
		// all the admin all studio access
		if (this.isAdmin(user)) {
			return true
		}
	}

	public async adminOnly(_: User) {
		return false
	}

	public async viewDashboard(user: User) {
		return this.isLvl1Contributor(user)
	}

	public async viewPosts(_: User) {
		return false
	}

	public async viewCollections(_: User) {
		return false
	}

	public async viewTaxonomies(_: User) {
		return false
	}

	public async viewComments(user: User) {
		return this.isAuthenticated(user)
	}

	public async viewUsers(_user: User) {
		return false
	}

	public async viewSettings(user: User) {
		return this.isAuthenticated(user)
	}

  public async purgeCache(_: User) {
    return false
  }
}
