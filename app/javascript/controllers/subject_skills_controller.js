import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["subjectSelect", "skillSelect"]

  connect() {
    console.log("Subject Skills controller connected")
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
    
    console.log("Updating skills dropdown for subject ID:", subjectId)
    
    // Clear existing options
    skillSelect.innerHTML = '<option value="">Select Existing Skill</option>'
    
    if (!subjectId) {
      console.log("No subject selected, clearing dropdown")
      return
    }

    try {
      // Get skills for the selected subject from the data attribute
      const subjectsData = this.subjectSelectTarget.dataset.subjects
      console.log("Subjects data:", subjectsData)
      
      const subjects = JSON.parse(subjectsData)
      console.log("Parsed subjects:", subjects)
      
      const subject = subjects.find(s => s.id.toString() === subjectId)
      console.log("Selected subject:", subject)
      
      if (subject && subject.skills && subject.skills.length > 0) {
        console.log("Found skills:", subject.skills)
        subject.skills.forEach(skill => {
          const option = document.createElement('option')
          option.value = skill.id
          option.textContent = skill.name
          skillSelect.appendChild(option)
        })
      } else {
        console.log("No skills found for subject")
      }
    } catch (error) {
      console.error("Error updating skills dropdown:", error)
    }
  }
}
