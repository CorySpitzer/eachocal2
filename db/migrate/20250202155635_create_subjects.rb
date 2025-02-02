class CreateSubjects < ActiveRecord::Migration[7.1]
  def change
    create_table :subjects do |t|
      t.string :name, null: false
      t.text :description
      t.integer :user_id, null: false

      t.timestamps
    end

    create_table :skills_subjects do |t|
      t.belongs_to :skill, null: false, foreign_key: true
      t.belongs_to :subject, null: false, foreign_key: true

      t.timestamps
    end

    add_index :subjects, [:user_id, :name], unique: true
    add_foreign_key :subjects, :users
  end
end
