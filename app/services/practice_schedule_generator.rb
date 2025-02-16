class PracticeScheduleGenerator
  def self.generate_schedules(skill, days_ahead = 30)
    return unless skill.pattern.present? && skill.start_date.present?
    
    case skill.pattern
    when 'ClassicLogN'
      generate_classic_logn_schedule(skill, days_ahead)
    else
      raise "Unknown pattern: #{skill.pattern}"
    end
  end

  private

  def self.generate_classic_logn_schedule(skill, days_ahead)
    return if skill.start_date > Date.current + days_ahead.days

    # Get the date range we're working with
    start_date = [skill.start_date, Date.current].max
    end_date = Date.current + days_ahead.days

    # Calculate practice dates based on logarithmic spacing
    practice_dates = calculate_classic_logn_dates(skill.start_date, start_date, end_date)

    # Create practice schedules for each date
    practice_dates.each do |date|
      skill.practice_schedules.find_or_create_by!(scheduled_date: date)
    end
  end

  def self.calculate_classic_logn_dates(start_date, range_start, range_end)
    days_since_start = (range_end - start_date).to_i
    return [] if days_since_start < 0

    # Classic spaced repetition intervals: 0, 1, 2, 4, 8, 16, 32...
    intervals = []
    
    # Add the start date itself (0 days interval)
    intervals << start_date if start_date >= range_start && start_date <= range_end
    
    # Add the exponentially increasing intervals
    interval = 1
    while interval <= days_since_start
      practice_date = start_date + interval.days
      intervals << practice_date if practice_date >= range_start && practice_date <= range_end
      interval *= 2
    end

    intervals
  end
end
