import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["menu", "hamburger"]

  connect() {
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!this.element.contains(event.target) && this.menuTarget.classList.contains('show')) {
        this.closeMenu()
      }
    })
  }

  toggleMenu() {
    this.menuTarget.classList.toggle('show')
    this.hamburgerTarget.classList.toggle('active')
  }

  closeMenu() {
    this.menuTarget.classList.remove('show')
    this.hamburgerTarget.classList.remove('active')
  }
}
