import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    const markers = document.querySelectorAll('[data-color]');
    markers.forEach(marker => {
      marker.style.setProperty('--skill-color', marker.dataset.color);
    });
  }
}
