class CreatePracticeSchedules < ActiveRecord::Migration[7.1]
  def change
    create_table :practice_schedules do |t|
      t.references :skill, null: false, foreign_key: true
      t.date :scheduled_date, null: false
      t.boolean :completed, default: false

      t.timestamps
    end

    add_index :practice_schedules, [:skill_id, :scheduled_date]
  end
end
