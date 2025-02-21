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

    generate_schedule_for_pattern(skill, pattern_intervals)
  end

  private

  def self.generate_schedule_for_pattern(skill, intervals)
    # Generate dates exactly like the homepage does
    practice_dates = generate_dates(skill.start_date, intervals)
    
    # Create practice schedules and sessions for each date
    practice_dates.each do |date|
      # Create the practice schedule
      schedule = skill.practice_schedules.find_or_create_by!(scheduled_date: date)
      
      # Create the corresponding practice session
      skill.practice_sessions.find_or_create_by!(scheduled_date: date)
    end
  end

  def self.generate_dates(start_date, intervals)
    dates = []
    
    # For each interval in the pattern, add that many days to the start date
    intervals.each do |days|
      practice_date = start_date + days.days
      dates << practice_date
    end
    
    # Return sorted unique dates
    dates.uniq.sort
  end
end
