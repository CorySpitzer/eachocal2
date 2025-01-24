class CreatePracticeSessions < ActiveRecord::Migration[7.1]
  def change
    create_table :practice_sessions do |t|
      t.references :skill, null: false, foreign_key: true
      t.date :scheduled_date
      t.integer :rating

      t.timestamps
    end
  end
end
