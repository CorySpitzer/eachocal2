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
    start_date = [skill.start_date.beginning_of_day, Date.current.beginning_of_day].max
    end_date = Date.current.beginning_of_day + days_ahead.days

    # Calculate practice dates based on logarithmic spacing
    practice_dates = calculate_classic_logn_dates(skill.start_date.beginning_of_day, start_date, end_date)

    # Create practice schedules for each date
    practice_dates.each do |date|
      skill.practice_schedules.find_or_create_by!(scheduled_date: date.beginning_of_day)
    end
  end

  def self.calculate_classic_logn_dates(start_date, range_start, range_end)
    days_since_start = (range_end - start_date).to_i
    return [] if days_since_start < 0

    # Classic spaced repetition intervals: 0, 1, 2, 4, 8, 16, 32...
    intervals = []
    
    # Start with 0 days interval (the start date itself)
    current_interval = 0
    
    while current_interval <= days_since_start
      practice_date = start_date + current_interval.days
      practice_date = practice_date.beginning_of_day
      
      Rails.logger.info "Considering interval #{current_interval} for date #{practice_date}"
      
      if practice_date >= range_start && practice_date <= range_end
        Rails.logger.info "Adding practice date: #{practice_date}"
        intervals << practice_date
      end
      
      # For the next interval:
      # If we're at 0, go to 1
      # Otherwise, double the current interval
      current_interval = (current_interval == 0) ? 1 : current_interval * 2
    end

    Rails.logger.info "Generated practice dates for #{start_date}: #{intervals.map(&:to_s)}"
    intervals.sort
  end
end
