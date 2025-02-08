import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["subjectSelect", "skillSelect", "newSkillLink"]

  connect() {
    if (this.hasSubjectSelectTarget) {
      this.updateSkillsDropdown()
    }
  }

  updateSkillsDropdown() {
    const subjectId = this.subjectSelectTarget.value
    const skillsSelect = this.skillSelectTarget
    const newSkillLink = this.hasNewSkillLinkTarget ? this.newSkillLinkTarget : null

    // Clear existing options
    skillsSelect.innerHTML = '<option value="">Select a skill</option>'

    if (!subjectId) {
      if (newSkillLink) {
        newSkillLink.style.display = 'none'
      }
      return
    }

    // Get the skills data from the data attribute
    const subjectsData = JSON.parse(this.subjectSelectTarget.dataset.skills)
    const selectedSubject = subjectsData.find(subject => subject.id === parseInt(subjectId))

    if (selectedSubject) {
      const skills = JSON.parse(selectedSubject.skills)
      skills.forEach(skill => {
        const option = document.createElement('option')
        option.value = skill.id
        option.textContent = skill.name
        skillsSelect.appendChild(option)
      })

      // Update the "Add New Skill" link if it exists
      if (newSkillLink) {
        newSkillLink.style.display = 'block'
        newSkillLink.href = `/subjects/${subjectId}/skills/new`
      }
    }
  }
}
