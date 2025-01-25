// Current reference time (2025-01-05)
const REFERENCE_TIME = new Date('2025-01-05T09:54:30-05:00');

// Spaced repetition patterns (in days)
const PATTERNS = {
    'Classic': [1, 2, 4, 7, 14, 30, 60, 120],
    'Aggressive': [1, 3, 7, 14, 30, 45, 90],
    'Gentle': [1, 2, 3, 5, 8, 13, 21, 34],
    'Custom': [1, 4, 10, 20, 40, 80, 160],
    'Double': [1, 2, 4, 8, 16, 32, 64, 128],
    'Linear': [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120],
    'Fibonacci': [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233]
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', addSkill);

    // Set default date to today
    document.getElementById('startDate').valueAsDate = new Date(REFERENCE_TIME);

    // Load existing skills
    loadExistingSkills();
});

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
    const skillInput = document.getElementById('skillInput');
    const startDateInput = document.getElementById('startDate');
    const skillList = document.getElementById('skillList');

    if (!skillInput.value || !startDateInput.value) {
        alert('Please enter both skill name and start date');
        return;
    }

    try {
        const response = await fetch('/api/skills', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify({
                skill: {
                    name: skillInput.value,
                    pattern: 'Classic', // Default pattern
                    start_date: startDateInput.value
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.join(', ') || 'Failed to save skill');
        }

        const data = await response.json();
        createSkillElement(data.skill, data.practice_sessions);
        
        // Clear inputs
        skillInput.value = '';
    } catch (error) {
        alert('Error saving skill: ' + error.message);
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
                updateCalendar(calendarWidget, data.skill.start_date, data.skill.pattern);
            }

            // Hide save button after successful save
            saveButton.style.display = 'none';
            
            // Show success message
            alert('Pattern updated successfully!');
        } catch (error) {
            alert('Error updating pattern: ' + error.message);
        }
    });

    patternContainer.appendChild(patternSelect);
    patternContainer.appendChild(saveButton);

    // Create schedule display
    const scheduleSpan = document.createElement('div');
    scheduleSpan.className = 'schedule-span';
    
    // Create calendar toggle button
    const calendarToggle = document.createElement('button');
    calendarToggle.className = 'calendar-toggle';
    calendarToggle.innerHTML = ' Calendar';
    
    // Create calendar widget
    const calendarWidget = document.createElement('div');
    calendarWidget.className = 'calendar-widget';
    
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
    
    // Toggle calendar visibility
    calendarToggle.addEventListener('click', () => {
        calendarWidget.classList.toggle('visible');
        if (calendarWidget.classList.contains('visible')) {
            updateCalendar(calendarWidget, skill.start_date, skill.pattern);
        }
    });

    // Add elements to skill header
    skillHeader.appendChild(skillNameSection);
    skillHeader.appendChild(patternContainer);
    skillHeader.appendChild(calendarToggle);
    skillHeader.appendChild(deleteBtn);

    // Add elements to skill info
    skillInfo.appendChild(skillHeader);
    skillInfo.appendChild(scheduleSpan);

    // Add elements to skill item
    skillItem.appendChild(skillInfo);
    skillItem.appendChild(calendarWidget);

    // Update schedule with practice sessions
    updateScheduleWithSessions(scheduleSpan, practiceSessions);

    // Update schedule when pattern changes
    patternSelect.addEventListener('change', () => {
        updateSchedule(scheduleSpan, skill.start_date, patternSelect.value);
        if (calendarWidget.classList.contains('visible')) {
            updateCalendar(calendarWidget, skill.start_date, patternSelect.value);
        }
    });

    document.getElementById('skillList').appendChild(skillItem);
}

function updateScheduleWithSessions(scheduleSpan, practiceSessions) {
    // Clear previous content
    scheduleSpan.innerHTML = '';

    // Add explanatory text
    const explanationText = document.createElement('p');
    explanationText.textContent = "How well did you know the concept or how well could you solve the problem?";
    explanationText.style.marginBottom = '1rem';
    scheduleSpan.appendChild(explanationText);

    practiceSessions.forEach(session => {
        const dateItem = document.createElement('div');
        dateItem.className = 'date-item';

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
        saveRatingBtn.style.display = 'none';

        // Show save button when rating changes
        ratingSelect.addEventListener('change', () => {
            saveRatingBtn.style.display = 'inline-block';
        });

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

                saveRatingBtn.style.display = 'none';
                showNotification('Rating saved successfully', 'success');
            } catch (error) {
                console.error('Error saving rating:', error);
                showNotification('Failed to save rating', 'error');
            }
        });

        // Create date text
        const dateText = document.createElement('span');
        dateText.textContent = new Date(session.scheduled_date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        // Assemble date item
        dateItem.appendChild(dateText);
        dateItem.appendChild(ratingSelect);
        dateItem.appendChild(saveRatingBtn);
        scheduleSpan.appendChild(dateItem);
    });
}

function updateSchedule(scheduleSpan, startDate, patternName) {
    const pattern = PATTERNS[patternName];
    const dates = generateDates(new Date(startDate), pattern);
    
    // Clear previous content
    scheduleSpan.innerHTML = '';

    // Add explanatory text
    const explanationText = document.createElement('p');
    explanationText.textContent = "How well did you know the concept or how well could you solve the problem?";
    explanationText.style.marginBottom = '1rem';
    scheduleSpan.appendChild(explanationText);

    dates.forEach(date => {
        const dateItem = document.createElement('div');
        dateItem.className = 'date-item';

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
            ratingSelect.appendChild(option);
        }

        // Create save button
        const saveRatingBtn = document.createElement('button');
        saveRatingBtn.className = 'save-rating-btn';
        saveRatingBtn.textContent = 'Save';
        saveRatingBtn.style.display = 'none';

        // Show save button when rating changes
        ratingSelect.addEventListener('change', () => {
            saveRatingBtn.style.display = 'inline-block';
        });

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

                saveRatingBtn.style.display = 'none';
                showNotification('Rating saved successfully', 'success');
            } catch (error) {
                console.error('Error saving rating:', error);
                showNotification('Failed to save rating', 'error');
            }
        });

        // Create date text
        const dateText = document.createElement('span');
        dateText.textContent = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        // Assemble date item
        dateItem.appendChild(dateText);
        dateItem.appendChild(ratingSelect);
        dateItem.appendChild(saveRatingBtn);
        scheduleSpan.appendChild(dateItem);
    });
}

function updateCalendar(calendarWidget, startDate, patternName) {
    const pattern = PATTERNS[patternName];
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
            new Date(REFERENCE_TIME)
        ));
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    
    calendarWidget.appendChild(monthsContainer);
}

function generateMonthCalendar(date, studyDates, today) {
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
        if (studyDates.some(studyDate => 
            studyDate.getDate() === currentDate.getDate() &&
            studyDate.getMonth() === currentDate.getMonth() &&
            studyDate.getFullYear() === currentDate.getFullYear()
        )) {
            dayDiv.classList.add('study-day');
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
    const dates = [];
    let currentDate = new Date(startDate);
    
    for (const days of pattern) {
        currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + days);
        dates.push(new Date(currentDate));
    }
    
    return dates;
}