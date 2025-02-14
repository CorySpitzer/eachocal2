import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["skillItem"]

  connect() {
    // Add mouseover listeners for tooltips
    this.element.querySelectorAll('.skill-item[title]').forEach(el => {
      el.addEventListener('mouseover', (e) => this.showTooltip(e))
      el.addEventListener('mouseout', (e) => this.hideTooltip(e))
    })
  }

  showTooltip(event) {
    const el = event.currentTarget
    const title = el.getAttribute('title')
    if (!title) return

    // Create tooltip element
    const tooltip = document.createElement('div')
    tooltip.className = 'custom-tooltip'
    tooltip.textContent = title
    document.body.appendChild(tooltip)

    // Position tooltip
    const rect = el.getBoundingClientRect()
    tooltip.style.left = rect.right + 8 + 'px'
    tooltip.style.top = rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2) + 'px'

    // Store tooltip reference
    el.tooltip = tooltip
    // Clear title to prevent native tooltip
    el.setAttribute('data-title', title)
    el.removeAttribute('title')
  }

  hideTooltip(event) {
    const el = event.currentTarget
    if (el.tooltip) {
      el.tooltip.remove()
      // Restore title
      el.setAttribute('title', el.getAttribute('data-title'))
      el.removeAttribute('data-title')
    }
  }

  async updateRating(event) {
    const skillItem = event.currentTarget
    const skillId = skillItem.dataset.skillId
    const currentRating = parseInt(skillItem.dataset.rating) || 0
    
    // Prompt for new rating
    const newRating = prompt(`Current rating: ${currentRating}\nEnter new rating (1-5):`)
    
    if (newRating === null) return // User cancelled
    
    const rating = parseInt(newRating)
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert("Please enter a number between 1 and 5")
      return
    }

    try {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
          skill: { rating: rating }
        })
      })

      if (response.ok) {
        // Update the UI
        const ratingSpan = skillItem.querySelector('.skill-rating')
        ratingSpan.innerHTML = Array(rating).fill('<i class="bi bi-star-fill text-warning"></i>').join('')
        
        // Update the tooltip title
        const skillName = skillItem.querySelector('.skill-name').textContent.trim()
        skillItem.setAttribute('title', `${skillName} (${rating} stars)`)
        
        // Update the data attribute
        skillItem.dataset.rating = rating.toString()
      } else {
        alert("Failed to update rating")
      }
    } catch (error) {
      console.error('Error:', error)
      alert("Failed to update rating")
    }
  }
}
