import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["subjectSelect"]

  connect() {
    this.setupSkillInputs()
  }

  setupSkillInputs() {
    const newSkillInput = document.getElementById('newSkillInput')
    const baseSkillSelect = document.getElementById('base_skill_id')

    // When dropdown is selected, clear text input
    baseSkillSelect.addEventListener('change', () => {
      if (baseSkillSelect.value) {
        newSkillInput.value = ''
      }
    })

    // When text is entered, clear dropdown selection
    newSkillInput.addEventListener('input', () => {
      if (newSkillInput.value) {
        baseSkillSelect.value = ''
      }
    })
  }

  updateSkillsDropdown() {
    // This method is now empty since we don't need to update any skill dropdown
    // but we keep it because it's still called by the subject select's change event
  }
}
