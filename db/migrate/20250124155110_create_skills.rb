class CreateSkills < ActiveRecord::Migration[7.1]
  def change
    create_table :skills do |t|
      t.string :name
      t.string :pattern
      t.date :start_date

      t.timestamps
    end
  end
end
