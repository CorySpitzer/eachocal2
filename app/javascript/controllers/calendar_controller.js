import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  changeMonth(event) {
    const month = event.target.value
    const year = document.getElementById('year-select').value
    this.navigateToDate(year, month)
  }

  changeYear(event) {
    const year = event.target.value
    const month = document.getElementById('month-select').value
    this.navigateToDate(year, month)
  }

  prevMonth() {
    const monthSelect = document.getElementById('month-select')
    const yearSelect = document.getElementById('year-select')
    let month = parseInt(monthSelect.value)
    let year = parseInt(yearSelect.value)

    month--
    if (month < 1) {
      month = 12
      year--
    }

    monthSelect.value = month
    yearSelect.value = year
    this.navigateToDate(year, month)
  }

  nextMonth() {
    const monthSelect = document.getElementById('month-select')
    const yearSelect = document.getElementById('year-select')
    let month = parseInt(monthSelect.value)
    let year = parseInt(yearSelect.value)

    month++
    if (month > 12) {
      month = 1
      year++
    }

    monthSelect.value = month
    yearSelect.value = year
    this.navigateToDate(year, month)
  }

  prevYear() {
    const yearSelect = document.getElementById('year-select')
    const month = document.getElementById('month-select').value
    const year = parseInt(yearSelect.value) - 1
    
    if (yearSelect.querySelector(`option[value="${year}"]`)) {
      yearSelect.value = year
      this.navigateToDate(year, month)
    }
  }

  nextYear() {
    const yearSelect = document.getElementById('year-select')
    const month = document.getElementById('month-select').value
    const year = parseInt(yearSelect.value) + 1
    
    if (yearSelect.querySelector(`option[value="${year}"]`)) {
      yearSelect.value = year
      this.navigateToDate(year, month)
    }
  }

  navigateToDate(year, month) {
    const url = `/calendar?year=${year}&month=${month}`
    window.Turbo.visit(url)
  }
}
