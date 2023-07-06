/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'


// AUTH
Route.get('/signin',  'AuthController.signinShow').as('auth.signin.show')
Route.post('/signin', 'AuthController.signin').as('auth.signin')//.middleware(['honeypot'])
Route.get('/signout', 'AuthController.signout').as('auth.signout')

/**
 * images
 */
Route.get('/img/:userId/:filename', 'AssetsController.show').as('userimg')
Route.get('/img/*', 'AssetsController.show').where('path', /.*/).as('img')

// STUDIO
Route.group(() => {

  Route.get('/', 'DashboardController.index').as('dashboard.index')

  Route.group(() => {

    Route.get('/:postTypeId?',  'PostsController.index').as('index').where('postTypeId', Route.matchers.number())
    Route.get('/create',        'PostsController.create').as('create')
    Route.post('/',             'PostsController.store').as('store')
    Route.get('/:id/edit',      'PostsController.edit').as('edit')
    Route.put('/:id',           'PostsController.update').as('update')
    Route.delete('/:id',        'PostsController.destroy').as('destroy')

  }).prefix('/posts').as('posts').middleware(['role:admin,contributor'])

  Route.group(() => {

    Route.get('/',          'CollectionsController.index').as('index')
    Route.get('/create',    'CollectionsController.create').as('create')
    Route.post('/',         'CollectionsController.store').as('store')
    Route.get('/:id/edit',  'CollectionsController.edit').as('edit')
    Route.put('/:id',       'CollectionsController.update').as('update')
    Route.delete('/:id',    'CollectionsController.destroy').as('destroy')

  }).prefix('/collections').as('collections').middleware(['role:admin,contributor'])

  Route.group(() => {

    Route.get('/',          'TaxonomiesController.index').as('index')
    Route.get('/create',    'TaxonomiesController.create').as('create')
    Route.post('/',         'TaxonomiesController.store').as('store')
    Route.get('/:id/edit',  'TaxonomiesController.edit').as('edit')
    Route.put('/:id',       'TaxonomiesController.update').as('update')
    Route.delete('/:id',    'TaxonomiesController.destroy').as('destroy')

  }).prefix('/taxonomies').as('taxonomies').middleware(['role:admin,contributor'])

  Route.group(() => {

    Route.get('/:stateId?', 'CommentsController.index').as('index')
    Route.patch('/:id/state/:stateId', 'CommentsController.state').as('state').where('stateId', Route.matchers.number())

  }).prefix('/comments').as('comments')

  Route.group(() => {

    Route.get('/', 'BlocksController.index').as('index')
    Route.get('/create', 'BlocksController.create').as('create')

  }).prefix('/blocked').as('blocked').middleware(['role:admin'])

  Route.group(() => {

    Route.get('/', 'UsersController.index').as('index')
    Route.get('/:id', 'UsersController.show').as('show').where('id', Route.matchers.number())
    Route.patch('/:id/role', 'UsersController.role').as('role').where('id', Route.matchers.number())
    
    Route.group(() => {

      Route.get('/', 'RolesController.index').as('index')
      Route.get('/:id', 'RolesController.show').as('show')
      Route.get('/create', 'RolesController.create').as('create')
      Route.post('/', 'RolesController.store').as('store')
      Route.get('/:id/edit', 'RolesController.edit').as('edit')
      Route.put('/:id', 'RolesController.update').as('update')
    
    }).prefix('/roles').as('roles')

  }).prefix('/users').as('users').middleware(['role:admin'])

  Route.group(() => {

    Route.get('/', 'SettingsController.index').as('index')
    Route.patch('/username', 'SettingsController.usernameUpdate').as('username.update')
    Route.post('/username/unique', 'SettingsController.usernameUnique').as('username.unique')
    Route.put('/email', 'SettingsController.emailUpdate').as('email')
    Route.put('/email/notifications', 'SettingsController.emailNotificationUpdate').as('email.notifications')
    Route.get('/email/undo/:id/:oldEmail/:newEmail', 'SettingsController.emailRevert').as('email.undo')
    Route.post('/account/delete', 'SettingsController.deleteAccount').as('account.delete')

    Route.post('/cache/purge', 'SettingsController.purgeCache').as('cache.purge').middleware(['role:admin'])

  }).prefix('/settings').as('settings')

}).as('studio').middleware(['auth'])

// API
Route.group(() => {

  Route.post('/studio/assets', 'AssetsController.store').as('studio.assets.store').middleware(['role:admin'])
  Route.delete('/studio/assets/:id', 'AssetsController.destroy').as('studio.assets.destroy').middleware(['role:admin'])
  Route.post('/studio/editor/assets', 'AssetsController.store').as('studio.editor.asset').middleware(['role:admin'])

  Route.post('/notifications/read', 'NotificationsController.read').as('notifications.read')

  Route.group(() => {

    Route.get('/posts/search', 'PostsController.search').as('posts.search')

    Route.post('/collections/stub', 'CollectionsController.stub').as('collections.stub')

  }).as('studio').middleware(['role:admin,contributor'])

}).prefix('/api').as('api').middleware(['auth'])

// GO
Route.group(() => {

  Route.get('/post/:postId/comment/:commentId', 'GoController.comment').as('comment')

}).prefix('/go').as('go')
