import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["skillItem"]

  connect() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
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
        
        // Update the tooltip
        const tooltip = bootstrap.Tooltip.getInstance(skillItem)
        if (tooltip) {
          const skillName = skillItem.querySelector('.skill-name').textContent.trim()
          skillItem.setAttribute('title', `${skillName} (${rating} stars)`)
          tooltip.dispose()
          new bootstrap.Tooltip(skillItem)
        }
        
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
