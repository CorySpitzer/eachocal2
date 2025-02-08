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

    // Handle clicks on practice markers
    calendar.addEventListener('click', (event) => {
        const marker = event.target.closest('.practice-marker');
        if (!marker) return;

        // Remove any existing rating dropdowns
        document.querySelectorAll('.floating-rating').forEach(el => el.remove());

        // Get session data from the marker's data attributes
        const sessionId = marker.dataset.sessionId;
        const rating = parseInt(marker.dataset.rating) || 0;

        // Create and position the rating dropdown
        const session = { id: sessionId, rating };
        const ratingDropdown = createRatingDropdown(session, (newRating) => {
            // Update marker appearance after rating
            marker.classList.remove('scheduled');
            marker.classList.add('completed');
            marker.dataset.rating = newRating;
            marker.style.opacity = (0.2 + (newRating * 0.16)).toString();
            
            // Update tooltip
            const skillName = marker.title.split(':')[1].split('(')[0].trim();
            marker.title = `Completed: ${skillName} (${'★'.repeat(newRating)})`;
        });

        // Position the dropdown relative to the marker
        const markerRect = marker.getBoundingClientRect();
        ratingDropdown.style.position = 'absolute';
        ratingDropdown.style.bottom = '100%';
        ratingDropdown.style.left = '50%';
        ratingDropdown.style.transform = 'translateX(-50%)';  // Center it horizontally
        ratingDropdown.style.backgroundColor = 'white';
        ratingDropdown.style.zIndex = '1000';
        
        // Add it to the marker's parent for proper positioning
        marker.parentElement.appendChild(ratingDropdown);
        event.stopPropagation();
    });
});
