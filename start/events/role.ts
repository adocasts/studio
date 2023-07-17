import Event from '@ioc:Adonis/Core/Event'
import Mail from '@ioc:Adonis/Addons/Mail'

Event.on('role:upgrade:contributor_lvl_1', async ({ user, oldRole, newRole }) => {
  await Mail.sendLater(message => {
    message
      .to(user.email)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject("[Adocasts] You've been upgraded to contributor level 1.")
      .htmlView('emails/notifications/role_upgrade_contributor_lvl_1', { user, oldRole, newRole })
  })
})

Event.on('role:upgrade:contributor_lvl_2', async ({ user, oldRole, newRole }) => {
  await Mail.sendLater(message => {
    message
      .to(user.email)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject("[Adocasts] You've been upgraded to contributor level 2.")
      .htmlView('emails/notifications/role_upgrade_contributor_lvl_2', { user, oldRole, newRole })
  })
})

Event.on('role:upgrade:admin', async ({ user, oldRole, newRole }) => {
  await Mail.sendLater(message => {
    message
      .to(user.email)
      .from('noreply@adocasts.com', 'Adocasts')
      .subject("[Adocasts] You've been upgraded to an administrator.")
      .htmlView('emails/notifications/role_upgrade_admin', { user, oldRole, newRole })
  })
})