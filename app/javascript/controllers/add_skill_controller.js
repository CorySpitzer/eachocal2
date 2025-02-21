import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["subject", "baseSkill", "newSkill", "startDate"]

  async add(event) {
    event.preventDefault()

    const subjectId = this.subjectTarget.value
    const baseSkillId = this.baseSkillTarget.value
    const newSkillName = this.newSkillTarget.value
    const startDate = this.startDateTarget.value

    if (!subjectId) {
      alert('Please select a subject')
      return
    }

    if (!baseSkillId && !newSkillName) {
      alert('Please either select a skill to add or enter a custom skill name')
      return
    }

    if (!startDate) {
      alert('Please select a start date')
      return
    }

    try {
      const response = await fetch('/add_skill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
          subject_id: subjectId,
          base_skill_id: baseSkillId,
          name: newSkillName,
          start_date: startDate
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add skill')
      }

      // Clear input
      this.newSkillTarget.value = ''
      
      // Refresh page to show new skill
      window.location.reload()
    } catch (error) {
      console.error('Error adding skill:', error)
      alert('Failed to add skill. Please try again.')
    }
  }
}
