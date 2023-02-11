import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import AuthAttemptService from 'App/Services/AuthAttemptService'
import SignUpValidator from 'App/Validators/SignUpValidator'
import SignInValidator from 'App/Validators/SignInValidator'

export default class AuthController {
  public async signupShow({ view, response, session, auth }: HttpContextContract) {
    if (auth.user) {
      session.flash('warn', "You're already logged in.")
      return response.redirect().toRoute('home')
    }

    return view.render('auth/signup')
  }

  public async signup({ request, response, auth, session }: HttpContextContract) {
    const data = await request.validate(SignUpValidator)
    const user = await User.create(data)

    await user.related('profile').create({})
    await auth.login(user)

    session.flash('success', 'Welcome to Adocasts!')

    return response.redirect('/')
  }

  public async signinShow({ view, response, session, auth }: HttpContextContract) {
    if (auth.user) {
      session.flash('warn', "You're already logged in.")
      return response.redirect().toPath('/')
    }

    return view.render('auth/signin')
  }

  public async signin({ request, response, auth, session }: HttpContextContract) {
    const { uid, password, remember_me } = await request.validate(SignInValidator)

    const loginAttemptsRemaining = await AuthAttemptService.getRemainingAttempts(uid)
    if (loginAttemptsRemaining <= 0) {
      session.flash('error', 'Your account has been locked due to repeated bad login attempts. Please reset your password.')
      return response.redirect('/forgot-password')
    }

    try {
      await auth.attempt(uid, password, remember_me)
      await AuthAttemptService.deleteBadAttempts(uid)
    } catch (error) {
      await AuthAttemptService.recordLoginAttempt(uid)

      session.flash('errors', { form: 'The provided username/email or password is incorrect' })
      return response.redirect().back()
    }

    session.flash('success', `Welcome back, ${auth.user!.username}!`)

    return response.redirect('/')
  }

  public async signout({ response, auth, session }: HttpContextContract) {
    await auth.logout()

    session.flash('success', 'You have been logged out')

    return response.redirect().toRoute('auth.signin.show')
  }
}
