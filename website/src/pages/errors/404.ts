import { ErrorPage } from './Error'

export class e404 extends ErrorPage {
  name = '404'

  public errorData = {
    show: true,
    title: 'Page not found',
    button: {
      text: 'Home',
      link: '/'
    }
  }
}