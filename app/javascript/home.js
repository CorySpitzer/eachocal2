// Current reference time (current time)
const REFERENCE_TIME = new Date();

// Spaced repetition patterns (in days)
const PATTERNS = {
    'ClassicLogN': [1, 2, 4, 7, 12, 20, 30, 42, 55, 70, 85, 102],
    'NLogN': [1, 2, 6, 12, 20, 30, 42, 55, 70, 85, 102, 120],
    'Classic': [1, 2, 4, 7, 14, 30, 60, 120],
    'Aggressive': [1, 3, 7, 14, 30, 45, 90],
    'Gentle': [1, 2, 3, 5, 8, 13, 21, 34],
    'Double': [1, 2, 4, 8, 16, 32, 64, 128],
    'Linear': [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120],
    'Fibonacci': [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233]
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

// Initialize the page
function initializePage() {
    const addSkillBtn = document.getElementById('addSkillBtn');
    if (addSkillBtn) {  // Only set up if we're on the home page
        addSkillBtn.addEventListener('click', addSkill);
        const dateInput = document.getElementById('startDate');
        if (dateInput) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
        }
        loadExistingSkills();
    }
}

document.addEventListener('DOMContentLoaded', initializePage);
document.addEventListener('turbo:render', initializePage);

async function loadExistingSkills() {
    try {
        const response = await fetch('/api/skills', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load skills');
        }

        const data = await response.json();
        data.skills.forEach(skillData => {
            createSkillElement(skillData.skill, skillData.practice_sessions);
        });
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

async function addSkill() {
    const baseSkillSelect = document.getElementById('base_skill_id');
    const newSkillInput = document.getElementById('newSkillInput');
    const startDateInput = document.getElementById('startDate');
    const subjectSelect = document.getElementById('subject_id');
    const skillList = document.getElementById('skillList');
    const patternSelect = document.getElementById('skillPattern');

    // Get skill name from either base skill dropdown or text input
    const skillName = newSkillInput.value || 
                     (baseSkillSelect.selectedOptions[0]?.text !== 'Select a Skill to Add' ? 
                      baseSkillSelect.selectedOptions[0]?.text : '');

    if (!skillName || !startDateInput.value) {
        alert('Please either select a skill to add or enter a custom skill name, and provide a start date');
        return;
    }

    const skillData = {
        name: skillName,
        pattern: patternSelect.value || 'ClassicLogN', // Use selected pattern or default
        start_date: startDateInput.value
    };

    // Add subject_ids if a subject is selected
    if (subjectSelect.value) {
        skillData.subject_ids = [parseInt(subjectSelect.value)];
    }

    try {
        const response = await fetch('/api/skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({
                skill: skillData,
                base_skill_id: baseSkillSelect.value || null
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.join(', ') || 'Failed to save skill');
        }

        const data = await response.json();
        createSkillElement(data.skill, data.practice_sessions);
        
        // Clear inputs
        newSkillInput.value = '';
        baseSkillSelect.value = '';
        startDateInput.value = '';

    } catch (error) {
        console.error('Error saving skill:', error);
        alert(error.message);
    }
}

function createSkillElement(skill, practiceSessions) {
    const skillItem = document.createElement('div');
    skillItem.className = 'skill-item';

    // Create skill info container
    const skillInfo = document.createElement('div');
    skillInfo.className = 'skill-info';

    // Create skill header
    const skillHeader = document.createElement('div');
    skillHeader.className = 'skill-header';

    // Create skill name section
    const skillNameSection = document.createElement('div');
    skillNameSection.className = 'skill-name';
    skillNameSection.innerHTML = `<strong>${skill.name}</strong>`;

    // Create pattern selector and save button container
    const patternContainer = document.createElement('div');
    patternContainer.className = 'pattern-container';
    patternContainer.style.display = 'flex';
    patternContainer.style.gap = '10px';
    patternContainer.style.alignItems = 'center';

    const patternSelect = document.createElement('select');
    patternSelect.className = 'pattern-select';
    Object.keys(PATTERNS).forEach(pattern => {
        const option = document.createElement('option');
        option.value = pattern;
        option.textContent = pattern;
        if (pattern === skill.pattern) {
            option.selected = true;
        }
        patternSelect.appendChild(option);
    });

    // Create save button
    const saveButton = document.createElement('button');
    saveButton.className = 'save-btn';
    saveButton.innerHTML = ' Save';
    saveButton.style.display = 'none'; // Initially hidden

    // Show save button when pattern changes
    patternSelect.addEventListener('change', () => {
        saveButton.style.display = 'block';
    });

    // Handle save button click
    saveButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/skills/${skill.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    skill: {
                        pattern: patternSelect.value
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.errors?.join(', ') || 'Failed to update pattern');
            }

            const data = await response.json();
            
            // Update the schedule with new practice sessions
            updateScheduleWithSessions(scheduleSpan, data.practice_sessions);
            
            // Update calendar if visible
            if (calendarWidget.classList.contains('visible')) {
                updateCalendar(calendarWidget, data.skill.start_date, data.skill.pattern, data.practice_sessions);
            }

            // Hide save button after successful save
            saveButton.style.display = 'none';
            
            console.log('Pattern updated successfully!');
        } catch (error) {
            alert('Error updating pattern: ' + error.message);
        }
    });

    patternContainer.appendChild(patternSelect);
    patternContainer.appendChild(saveButton);

    // Create schedule display
    const scheduleSpan = document.createElement('div');
    scheduleSpan.className = 'schedule-span';
    
    // Create calendar widget
    const calendarWidget = document.createElement('div');
    calendarWidget.className = 'calendar-widget visible'; // Make it visible by default
    calendarWidget.style.display = 'block'; // Show it immediately
    updateCalendar(calendarWidget, skill.start_date, skill.pattern, practiceSessions);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    // Create reset button and container
    const resetContainer = document.createElement('div');
    resetContainer.className = 'reset-container';
    resetContainer.style.marginBottom = '10px';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset-btn';
    resetBtn.innerHTML = 'Reset Start Date';

    // Create hidden reset form
    const resetForm = document.createElement('div');
    resetForm.className = 'reset-form';
    resetForm.style.display = 'none';
    resetForm.style.marginTop = '10px';

    const datePicker = document.createElement('input');
    datePicker.type = 'date';
    datePicker.className = 'reset-date-picker';
    datePicker.value = new Date('2025-02-14T11:15:35-05:00').toISOString().split('T')[0];

    const saveResetBtn = document.createElement('button');
    saveResetBtn.className = 'save-reset-btn';
    saveResetBtn.innerHTML = 'Save New Date';
    saveResetBtn.style.marginLeft = '8px';

    resetForm.appendChild(datePicker);
    resetForm.appendChild(saveResetBtn);
    
    resetContainer.appendChild(resetBtn);
    resetContainer.appendChild(resetForm);

    // Toggle reset form
    resetBtn.addEventListener('click', () => {
        resetForm.style.display = resetForm.style.display === 'none' ? 'block' : 'none';
    });

    // Handle save reset
    saveResetBtn.addEventListener('click', async () => {
        const confirmed = confirm('Are you sure you want to reset the start date? This will clear all existing ratings.');
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/skills/${skill.id}/reset_start_date`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ start_date: datePicker.value })
            });

            if (!response.ok) {
                throw new Error('Failed to reset start date');
            }

            const data = await response.json();
            
            // Update the skill and practice sessions
            skill.start_date = data.skill.start_date;
            practiceSessions = data.practice_sessions;

            // Update the calendar
            updateCalendar(calendarWidget, skill.start_date, skill.pattern, practiceSessions);

            // Hide the reset form
            resetForm.style.display = 'none';

        } catch (error) {
            console.error('Error resetting start date:', error);
            alert('Failed to reset start date. Please try again.');
        }
    });

    // Create delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = ' Delete';
    deleteBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this skill?')) {
            try {
                const response = await fetch(`/api/skills/${skill.id}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete skill');
                }

                skillList.removeChild(skillItem);
            } catch (error) {
                alert('Error deleting skill: ' + error.message);
            }
        }
    });
    
    // Add event listeners
    const calendarToggle = document.createElement('button');
    calendarToggle.className = 'calendar-toggle';
    calendarToggle.innerHTML = ' Calendar';
    calendarToggle.style.display = 'none'; // Hide the toggle button since calendar is always shown
    calendarToggle.addEventListener('click', () => {
        // Do nothing - calendar is always shown
    });

    buttonContainer.appendChild(resetContainer);
    buttonContainer.appendChild(deleteBtn);

    // Append elements
    skillHeader.appendChild(skillNameSection);
    skillHeader.appendChild(patternContainer);
    skillInfo.appendChild(skillHeader);
    skillInfo.appendChild(scheduleSpan);
    skillInfo.appendChild(calendarWidget);

    skillInfo.appendChild(buttonContainer);

    // Add elements to skill item
    skillItem.appendChild(skillInfo);

    // Update schedule with practice sessions
    updateScheduleWithSessions(scheduleSpan, practiceSessions);

    // Update schedule when pattern changes
    patternSelect.addEventListener('change', () => {
        updateSchedule(scheduleSpan, skill.start_date, patternSelect.value);
        if (calendarWidget.classList.contains('visible')) {
            updateCalendar(calendarWidget, skill.start_date, patternSelect.value, practiceSessions);
        }
    });

    document.getElementById('skillList').appendChild(skillItem);
}

function createRatingDropdown(session, onSave) {
    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'floating-rating';
    ratingContainer.style.position = 'absolute';
    ratingContainer.style.backgroundColor = 'white';
    ratingContainer.style.padding = '10px';
    ratingContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    ratingContainer.style.borderRadius = '4px';
    ratingContainer.style.zIndex = '1000';

    // Create rating dropdown
    const ratingSelect = document.createElement('select');
    ratingSelect.className = 'date-rating';
    
    // Add default "not rated" option
    const defaultOption = document.createElement('option');
    defaultOption.value = '0';
    defaultOption.textContent = '-- Rate --';
    ratingSelect.appendChild(defaultOption);
    
    // Add star ratings
    for (let i = 1; i <= 5; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = '★'.repeat(i);
        if (session.rating === i) {
            option.selected = true;
        }
        ratingSelect.appendChild(option);
    }

    // Create save button
    const saveRatingBtn = document.createElement('button');
    saveRatingBtn.className = 'save-rating-btn';
    saveRatingBtn.textContent = 'Save';
    saveRatingBtn.style.marginLeft = '8px';

    // Create cancel button (replacing close button)
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-rating-btn';
    cancelBtn.style.marginLeft = '8px';
    cancelBtn.addEventListener('click', () => ratingContainer.remove());

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'rating-buttons';
    buttonContainer.appendChild(saveRatingBtn);
    buttonContainer.appendChild(cancelBtn);

    // Handle save button click
    saveRatingBtn.addEventListener('click', async () => {
        const rating = ratingSelect.value;
        try {
            const response = await fetch(`/api/practice_sessions/${session.id}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating: parseInt(rating) })
            });

            if (!response.ok) {
                throw new Error('Failed to save rating');
            }

            // Call the onSave callback
            if (onSave) {
                onSave();
            }

            // Remove the rating container
            ratingContainer.remove();
        } catch (error) {
            console.error('Error saving rating:', error);
        }
    });

    ratingContainer.appendChild(ratingSelect);
    ratingContainer.appendChild(buttonContainer);

    return ratingContainer;
}

function updateScheduleWithSessions(scheduleSpan, practiceSessions) {
    // Clear previous content
    scheduleSpan.innerHTML = '';

    // Add explanatory text
    const explanationText = document.createElement('p');
    explanationText.textContent = "Click on calendar dates to rate your practice sessions.";
    explanationText.style.marginBottom = '1rem';
    scheduleSpan.appendChild(explanationText);
}

function updateSchedule(scheduleSpan, startDate, patternName) {
    // Default to 'Classic' if pattern is not found
    const pattern = PATTERNS[patternName] || PATTERNS['Classic'];
    if (!pattern) {
        console.error('No valid pattern found for:', patternName);
        return;
    }
    
    const dates = generateDates(new Date(startDate), pattern);
    
    // Clear previous content
    scheduleSpan.innerHTML = '';

    // Add explanatory text
    const explanationText = document.createElement('p');
    explanationText.textContent = "Click on calendar dates to rate your practice sessions.";
    explanationText.style.marginBottom = '1rem';
    scheduleSpan.appendChild(explanationText);

    dates.forEach(date => {
        const dateItem = document.createElement('div');
        dateItem.className = 'date-item';

        // Create date text
        const dateText = document.createElement('span');
        dateText.textContent = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        // Assemble date item
        dateItem.appendChild(dateText);
        scheduleSpan.appendChild(dateItem);
    });
}

function updateCalendar(calendarWidget, startDate, patternName, practiceSessions) {
    // Default to 'Classic' if pattern is not found
    const pattern = PATTERNS[patternName] || PATTERNS['Classic'];
    if (!pattern) {
        console.error('No valid pattern found for:', patternName);
        return;
    }
    
    const studyDates = generateDates(new Date(startDate), pattern);
    const startMonth = new Date(startDate);
    const endMonth = new Date(studyDates[studyDates.length - 1]);
    
    // Clear previous calendar
    calendarWidget.innerHTML = '';
    
    // Create months container
    const monthsContainer = document.createElement('div');
    monthsContainer.className = 'calendar-months';
    
    // Generate calendar for each month from start to end date
    let currentMonth = new Date(startMonth);
    while (currentMonth <= endMonth) {
        monthsContainer.appendChild(generateMonthCalendar(
            currentMonth,
            studyDates,
            new Date(), // Use current date
            practiceSessions
        ));
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    
    calendarWidget.appendChild(monthsContainer);
}

function generateMonthCalendar(date, studyDates, today, practiceSessions) {
    const monthContainer = document.createElement('div');
    monthContainer.className = 'month';
    
    // Add month header
    const monthHeader = document.createElement('div');
    monthHeader.className = 'month-header';
    monthHeader.textContent = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    monthContainer.appendChild(monthHeader);
    
    // Add weekday headers
    const weekdaysDiv = document.createElement('div');
    weekdaysDiv.className = 'weekdays';
    WEEKDAYS.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = day;
        weekdaysDiv.appendChild(dayDiv);
    });
    monthContainer.appendChild(weekdaysDiv);
    
    // Add days
    const daysDiv = document.createElement('div');
    daysDiv.className = 'days';
    
    // Add empty cells for days before start of month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        daysDiv.appendChild(emptyDay);
    }
    
    // Add all days of the month
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.textContent = i;
        
        const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
        
        // Check if it's a study day
        const isStudyDay = studyDates.some(studyDate => 
            studyDate.getDate() === currentDate.getDate() &&
            studyDate.getMonth() === currentDate.getMonth() &&
            studyDate.getFullYear() === currentDate.getFullYear()
        );

        if (isStudyDay) {
            // Find matching practice session
            const session = practiceSessions?.find(s => {
                const sessionDate = new Date(s.scheduled_date);
                return sessionDate.getDate() === currentDate.getDate() &&
                       sessionDate.getMonth() === currentDate.getMonth() &&
                       sessionDate.getFullYear() === currentDate.getFullYear();
            });

            if (session?.rating) {
                dayDiv.classList.add(`rated-${session.rating}`);
            } else {
                dayDiv.classList.add('study-day');
            }

            // Add click handler for study days
            dayDiv.addEventListener('click', (e) => {
                // Remove any existing rating dropdowns
                document.querySelectorAll('.floating-rating').forEach(el => el.remove());

                // Create and position the rating dropdown
                const ratingDropdown = createRatingDropdown(session || { rating: 0 }, () => {
                    // Reload the page after successful rating
                    window.location.reload();
                });

                // Position the dropdown near the clicked day
                const rect = dayDiv.getBoundingClientRect();
                ratingDropdown.style.left = `${rect.left}px`;
                ratingDropdown.style.top = `${rect.bottom + window.scrollY + 5}px`;

                // Add to document body
                document.body.appendChild(ratingDropdown);

                // Stop event propagation
                e.stopPropagation();
            });

            // Add click handler to document to close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.floating-rating') && !e.target.closest('.day')) {
                    document.querySelectorAll('.floating-rating').forEach(el => el.remove());
                }
            });
        }
        
        // Check if it's today
        if (today.getDate() === currentDate.getDate() &&
            today.getMonth() === currentDate.getMonth() &&
            today.getFullYear() === currentDate.getFullYear()) {
            dayDiv.classList.add('today');
        }
        
        daysDiv.appendChild(dayDiv);
    }
    
    monthContainer.appendChild(daysDiv);
    return monthContainer;
}

function generateDates(startDate, pattern) {
    if (!Array.isArray(pattern)) {
        console.error('Invalid pattern provided to generateDates:', pattern);
        return [];
    }

    const dates = [];
    let currentDate = new Date(startDate);
    
    for (const days of pattern) {
        currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + days);
        dates.push(new Date(currentDate));
    }
    
    return dates;
}