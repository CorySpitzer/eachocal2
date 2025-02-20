import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    sessionId: String,
    skillName: String
  }

  connect() {
    console.log('PracticeReschedule controller connected')
    
    // Only initialize modal if we're in the modal element
    if (this.element.id === 'rescheduleModal') {
      this.modalElement = this.element
      this.modal = new bootstrap.Modal(this.modalElement)
    }
  }

  openModal(event) {
    event.preventDefault()
    event.stopPropagation()
    
    const button = event.currentTarget
    const sessionId = button.dataset.sessionId
    const skillName = button.dataset.skillName
    
    // Find and initialize the modal
    const modalElement = document.getElementById('rescheduleModal')
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement)
    
    // Store the session ID on the modal element
    modalElement.dataset.sessionId = sessionId
    document.getElementById('skillName').textContent = skillName
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0]
    document.getElementById('newDate').min = today
    
    console.log('Opening modal for session:', sessionId)
    modal.show()
  }

  async reschedule(event) {
    event.preventDefault()
    console.log('Reschedule clicked')
    
    const modalElement = this.element.closest('.modal')
    const sessionId = modalElement.dataset.sessionId
    const newDate = document.getElementById('newDate').value
    
    if (!sessionId) {
      console.error('No session ID found')
      alert('Error: Session ID not found')
      return
    }

    if (!newDate) {
      alert('Please select a new date')
      return
    }

    console.log('Attempting to reschedule session:', sessionId, 'to date:', newDate)
    
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content
      if (!csrfToken) {
        throw new Error('CSRF token not found')
      }

      const response = await fetch(`/practice_sessions/${sessionId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ new_date: newDate })
      })

      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        throw new Error('Server returned non-JSON response')
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reschedule session')
      }

      console.log('Successfully rescheduled session:', data)
      // Refresh the calendar to show the updated schedule
      window.location.reload()
    } catch (error) {
      console.error('Error rescheduling session:', error)
      alert('Error: ' + error.message)
    } finally {
      const modal = bootstrap.Modal.getInstance(modalElement)
      if (modal) {
        modal.hide()
      }
    }
  }
}
