enum Role {
  USER = 1,
  ADMIN = 2,
  CONTRIBUTOR_LVL_1 = 3, // can only create, edit, delete posts they create
  CONTRIBUTOR_LVL_2 = 4, // can also create series & taxonomies & sync taxonomy lessons
}

export const RoleWeights = [Role.USER, Role.CONTRIBUTOR_LVL_1, Role.CONTRIBUTOR_LVL_2, Role.ADMIN]

export default Role;
