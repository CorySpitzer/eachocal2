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

    Rails.logger.info "Generating schedules for skill: #{skill.name}"
    Rails.logger.info "Start date: #{skill.start_date}"
    Rails.logger.info "Pattern: #{skill.pattern}"
    Rails.logger.info "Intervals: #{pattern_intervals.inspect}"

    generate_schedule_for_pattern(skill, pattern_intervals)
  end

  private

  def self.generate_schedule_for_pattern(skill, intervals)
    # Generate dates exactly like the homepage does
    practice_dates = generate_dates(skill.start_date, intervals)
    
    Rails.logger.info "Generated practice dates: #{practice_dates.inspect}"
    
    # Create practice schedules and sessions for each date
    practice_dates.each do |date|
      Rails.logger.info "Creating schedule and session for date: #{date}"
      
      # Store just the date without any time component
      schedule = skill.practice_schedules.find_or_create_by!(scheduled_date: date.to_date)
      Rails.logger.info "Created schedule with date: #{schedule.scheduled_date}"
      
      session = skill.practice_sessions.find_or_create_by!(scheduled_date: date.to_date)
      Rails.logger.info "Created session with date: #{session.scheduled_date}"
    end
  end

  def self.generate_dates(start_date, intervals)
    dates = []
    
    # Match JavaScript's behavior exactly:
    # new Date(startDate).setDate(getDate() + days)
    intervals.each do |days|
      # Add days to the start date
      practice_date = start_date.to_date + days.days
      
      Rails.logger.info "Adding #{days} days to #{start_date} = #{practice_date}"
      dates << practice_date
    end
    
    # Return sorted unique dates
    dates.uniq.sort
  end
end
