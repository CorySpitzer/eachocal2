import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["subjectSelect", "skillSelect"]

  connect() {
    this.updateSkillsDropdown()
    this.setupSkillInputs()
  }

  setupSkillInputs() {
    const skillSelect = this.skillSelectTarget
    const newSkillInput = document.getElementById('newSkillInput')

    // When dropdown is selected, clear text input
    skillSelect.addEventListener('change', () => {
      if (skillSelect.value) {
        newSkillInput.value = ''
      }
    })

    // When text is entered, clear dropdown selection
    newSkillInput.addEventListener('input', () => {
      if (newSkillInput.value) {
        skillSelect.value = ''
      }
    })
  }

  updateSkillsDropdown() {
    const subjectId = this.subjectSelectTarget.value
    const skillSelect = this.skillSelectTarget
    
    // Clear existing options
    skillSelect.innerHTML = '<option value="">Select Existing Skill</option>'
    
    if (!subjectId) return

    // Get skills for the selected subject from the data attribute
    const subjects = JSON.parse(this.subjectSelectTarget.dataset.subjects)
    const subject = subjects.find(s => s.id.toString() === subjectId)
    
    if (subject && subject.skills) {
      subject.skills.forEach(skill => {
        const option = document.createElement('option')
        option.value = skill.id
        option.textContent = skill.name
        skillSelect.appendChild(option)
      })
    }
  }
}
