// Create rating dropdown for a practice session
function createRatingDropdown(session, onSave) {
    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'floating-rating';
    ratingContainer.style.position = 'absolute';
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

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'rating-buttons';

    // Create save button
    const saveRatingBtn = document.createElement('button');
    saveRatingBtn.className = 'save-rating-btn';
    saveRatingBtn.textContent = 'Save';

    // Create cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-rating-btn';

    buttonContainer.appendChild(saveRatingBtn);
    buttonContainer.appendChild(cancelBtn);

    // Handle save button click
    saveRatingBtn.addEventListener('click', async () => {
        const rating = parseInt(ratingSelect.value);
        if (rating === 0) return;

        try {
            const response = await fetch(`/api/practice_sessions/${session.id}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ rating })
            });

            if (!response.ok) {
                throw new Error('Failed to save rating');
            }

            // Call the onSave callback
            if (onSave) {
                onSave(rating);
            }

            // Remove the rating container
            ratingContainer.remove();
        } catch (error) {
            console.error('Error saving rating:', error);
            alert('Failed to save rating. Please try again.');
        }
    });

    // Handle cancel button click
    cancelBtn.addEventListener('click', () => {
        ratingContainer.remove();
    });

    ratingContainer.appendChild(ratingSelect);
    ratingContainer.appendChild(buttonContainer);

    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', (event) => {
            if (!ratingContainer.contains(event.target)) {
                ratingContainer.remove();
            }
        }, { once: true });
    }, 0);

    return ratingContainer;
}

// Initialize calendar functionality
document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.querySelector('.calendar-grid');
    if (!calendar) return;

    // Handle clicks on skill items
    calendar.addEventListener('click', (event) => {
        const skillItem = event.target.closest('.skill-item');
        if (!skillItem) return;

        // Remove any existing rating dropdowns
        document.querySelectorAll('.floating-rating').forEach(el => el.remove());

        // Get session data from the skill item's data attributes
        const sessionId = skillItem.dataset.sessionId;
        const rating = parseInt(skillItem.dataset.rating) || 0;

        // Create and position the rating dropdown
        const session = { id: sessionId, rating };
        const ratingDropdown = createRatingDropdown(session, (newRating) => {
            // Update skill item appearance after rating
            skillItem.classList.remove('scheduled');
            skillItem.dataset.rating = newRating;
            
            const skillName = skillItem.querySelector('.skill-name');
            const color = skillItem.dataset.color;
            
            // Update color and style
            skillName.classList.add('rated');
            skillName.style.color = color;
            skillName.style.opacity = (0.4 + (newRating * 0.12)).toString();
            
            // Update tooltip
            const skillNameText = skillName.textContent.trim();
            skillItem.title = `Completed: ${skillNameText} (${newRating} stars)`;
        });

        // Position the dropdown relative to the skill item
        const itemRect = skillItem.getBoundingClientRect();
        ratingDropdown.style.position = 'absolute';
        ratingDropdown.style.top = `${itemRect.bottom + window.scrollY}px`;
        ratingDropdown.style.left = `${itemRect.left + window.scrollX}px`;
        ratingDropdown.style.backgroundColor = 'white';
        ratingDropdown.style.zIndex = '1000';
        
        // Add it to the body for proper positioning
        document.body.appendChild(ratingDropdown);
        event.stopPropagation();
    });
});
