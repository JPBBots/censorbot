import { Page, PageInterface } from "../../structures/Page";

export class ErrorPage extends Page implements PageInterface {
  _pageName = 'error'
  fetchElements = [
    'error',
    'title',
    'info',
    'button'
  ]

  /**
   * Error info
   */
  public errorData: {
    /**
     * Show as error
     */
    show: boolean

    /**
     * Title text
     */
    title: string

    /**
     * More detailed bottom text
     */
    info?: string

    /**
     * Button data
     */
    button?: {
      /**
       * Button inner text
       */
      text: string

      /**
       * Button redirect link
       */
      link: string
    }
  }

  async go () {
    this.e('error')[this.errorData.show ? 'setAttribute' : 'removeAttribute']('hidden', '')

    this.e('title').innerText = this.errorData.title

    if (this.errorData.info) {
      this.e('info').innerText = this.errorData.info
    } else {
      this.e('info').setAttribute('hidden', '')
    }

    if (!this.errorData.button) return this.e('button').setAttribute('hidden', '')

    this.e('button').innerText = this.errorData.button.text
    this.e('button').setAttribute('href', this.errorData.button.link)
  }

  async remove () {
    return true
  }
}