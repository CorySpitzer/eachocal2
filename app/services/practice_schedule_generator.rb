class PracticeScheduleGenerator
  PATTERNS = {
    'ClassicLogN' => [1, 2, 4, 7, 12, 20, 30, 42, 55, 70, 85, 102],
    'NLogN' => [1, 2, 6, 12, 20, 30, 42, 55, 70, 85, 102, 120],
    'Classic' => [1, 2, 4, 7, 14, 30, 60, 120],
    'Aggressive' => [1, 3, 7, 14, 30, 45, 90],
    'Gentle' => [1, 2, 3, 5, 8, 13, 21, 34],
    'Double' => [1, 2, 4, 8, 16, 32, 64, 128],
    'Linear' => [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91, 105, 120],
    'Fibonacci' => [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233]
  }

  def self.generate_schedules(skill, days_ahead = 30)
    return unless skill.pattern.present? && skill.start_date.present?
    
    pattern_intervals = PATTERNS[skill.pattern]
    raise "Unknown pattern: #{skill.pattern}" unless pattern_intervals

    generate_schedule_for_pattern(skill, pattern_intervals, days_ahead)
  end

  private

  def self.generate_schedule_for_pattern(skill, intervals, days_ahead)
    # Get the date range we're working with
    start_date = skill.start_date.beginning_of_day
    end_date = Date.current.beginning_of_day + days_ahead.days

    # Calculate practice dates based on the pattern intervals
    practice_dates = calculate_pattern_dates(start_date, end_date, intervals)

    # Create practice schedules and sessions for each date
    practice_dates.each do |date|
      # Add 1 day to the stored date to account for display adjustment
      stored_date = date + 1.day
      
      # Create the practice schedule
      schedule = skill.practice_schedules.find_or_create_by!(scheduled_date: stored_date)
      
      # Create the corresponding practice session if it doesn't exist
      skill.practice_sessions.find_or_create_by!(scheduled_date: stored_date)
    end
  end

  def self.calculate_pattern_dates(start_date, end_date, intervals)
    practice_dates = []
    
    # Always include the start date
    practice_dates << start_date

    # Add dates based on intervals
    intervals.each do |interval|
      practice_date = start_date + interval.days
      
      if practice_date <= end_date
        Rails.logger.info "Adding practice date: #{practice_date}"
        practice_dates << practice_date
      end
    end

    practice_dates.uniq.sort
  end
end
