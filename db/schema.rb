# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_02_06_165623) do
  create_table "practice_sessions", force: :cascade do |t|
    t.integer "skill_id", null: false
    t.date "scheduled_date"
    t.integer "rating"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["skill_id"], name: "index_practice_sessions_on_skill_id"
  end

  create_table "skills", force: :cascade do |t|
    t.string "name"
    t.string "pattern"
    t.date "start_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id"
    t.boolean "base_skill", default: false, null: false
    t.index ["base_skill"], name: "index_skills_on_base_skill"
    t.index ["user_id"], name: "index_skills_on_user_id"
  end

  create_table "skills_subjects", force: :cascade do |t|
    t.integer "skill_id", null: false
    t.integer "subject_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["skill_id"], name: "index_skills_subjects_on_skill_id"
    t.index ["subject_id"], name: "index_skills_subjects_on_subject_id"
  end

  create_table "subjects", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "name"], name: "index_subjects_on_user_id_and_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "practice_sessions", "skills"
  add_foreign_key "skills", "users"
  add_foreign_key "skills_subjects", "skills"
  add_foreign_key "skills_subjects", "subjects"
  add_foreign_key "subjects", "users"
end
