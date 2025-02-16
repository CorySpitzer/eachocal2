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
    const button = event.currentTarget
    const skillItem = button.closest('.skill-item')
    
    // Remove any existing rating dropdowns
    document.querySelectorAll('.floating-rating').forEach(el => el.remove())

    const session = {
      id: skillItem.dataset.sessionId,
      rating: parseInt(skillItem.dataset.rating) || 0
    }

    const ratingDropdown = this.createRatingDropdown(skillItem, session, (newRating) => {
      // Update skill item appearance after rating
      skillItem.classList.remove('scheduled')
      skillItem.dataset.rating = newRating
      
      const skillName = skillItem.querySelector('.skill-name')
      
      // Update color based on rating
      const colors = {
        5: "#2ecc71", // Green
        4: "#87d37c", // Yellow-Green
        3: "#f1c40f", // Yellow
        2: "#e67e22", // Orange
        1: "#e74c3c"  // Red
      }
      
      skillName.classList.add('rated')
      skillName.style.color = colors[newRating] || ''
      
      // Update button icon
      button.querySelector('i').className = 'bi bi-star-fill'
      button.title = 'Update rating'

      // Update stars display
      let ratingDisplay = skillItem.querySelector('.skill-rating')
      if (!ratingDisplay) {
        ratingDisplay = document.createElement('div')
        ratingDisplay.className = 'skill-rating'
        skillItem.querySelector('.d-flex').appendChild(ratingDisplay)
      }
      const stars = Array(newRating).fill('<i class="bi bi-star-fill text-warning"></i>').join('')
      ratingDisplay.innerHTML = stars
    })

    // Position the dropdown relative to the button
    const buttonRect = button.getBoundingClientRect()
    ratingDropdown.style.position = 'absolute'
    ratingDropdown.style.top = `${buttonRect.bottom + window.scrollY + 5}px`
    ratingDropdown.style.left = `${buttonRect.left + window.scrollX}px`
    ratingDropdown.style.backgroundColor = 'white'
    ratingDropdown.style.zIndex = '1000'
    
    // Add it to the body for proper positioning
    document.body.appendChild(ratingDropdown)
    event.stopPropagation()
  }

  createRatingDropdown(skillItem, session, onSave) {
    const ratingContainer = document.createElement('div')
    ratingContainer.className = 'floating-rating'
    
    // Create rating dropdown
    const ratingSelect = document.createElement('select')
    ratingSelect.className = 'date-rating'
    
    // Add default "not rated" option
    const defaultOption = document.createElement('option')
    defaultOption.value = '0'
    defaultOption.textContent = '-- Rate --'
    ratingSelect.appendChild(defaultOption)
    
    // Add star ratings
    for (let i = 1; i <= 5; i++) {
      const option = document.createElement('option')
      option.value = i
      option.textContent = '★'.repeat(i)
      if (session.rating === i) {
        option.selected = true
      }
      ratingSelect.appendChild(option)
    }

    // Create button container
    const buttonContainer = document.createElement('div')
    buttonContainer.className = 'rating-buttons'

    // Create save button
    const saveRatingBtn = document.createElement('button')
    saveRatingBtn.className = 'save-rating-btn'
    saveRatingBtn.textContent = 'Save'

    // Create cancel button
    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = 'Cancel'
    cancelBtn.className = 'cancel-rating-btn'

    buttonContainer.appendChild(saveRatingBtn)
    buttonContainer.appendChild(cancelBtn)

    // Handle save button click
    saveRatingBtn.addEventListener('click', async () => {
      const rating = parseInt(ratingSelect.value)
      if (rating === 0) return

      try {
        let response
        if (session.id) {
          // Update existing session
          response = await fetch(`/api/practice_sessions/${session.id}/rate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({ rating })
          })
        } else {
          // Create new session with rating
          const skillId = skillItem.dataset.skillId
          const dateText = document.querySelector('h4.text-muted').textContent.trim()
          
          // Parse and format the date properly
          const dateMatch = dateText.match(/(\w+), (\w+) (\d+), (\d+)/)
          if (!dateMatch) {
            console.error('Could not parse date:', dateText);
            alert('Error: Could not parse date format');
            return;
          }
          
          const [_, dayName, monthName, day, year] = dateMatch
          const date = new Date(`${monthName} ${day}, ${year}`)
          const scheduledDate = date.toISOString().split('T')[0] // Format as YYYY-MM-DD
          
          console.log('Creating practice session with:', {
            skillId,
            scheduledDate,
            rating,
            originalDateText: dateText
          });
          
          const requestBody = {
            practice_session: {
              scheduled_date: scheduledDate,
              rating: rating
            }
          };
          console.log('Request body:', JSON.stringify(requestBody, null, 2));
          
          response = await fetch(`/api/skills/${skillId}/practice_sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify(requestBody)
          })
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save rating')
        }

        // Call the onSave callback
        if (onSave) {
          onSave(rating)
        }

        // Remove the rating container
        ratingContainer.remove()
      } catch (error) {
        console.error('Error saving rating:', error)
        alert('Failed to save rating. Please try again.')
      }
    })

    // Handle cancel button click
    cancelBtn.addEventListener('click', () => {
      ratingContainer.remove()
    })

    ratingContainer.appendChild(ratingSelect)
    ratingContainer.appendChild(buttonContainer)

    // Close dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('click', (event) => {
        if (!ratingContainer.contains(event.target)) {
          ratingContainer.remove()
        }
      }, { once: true })
    }, 0)

    return ratingContainer
  }
}
