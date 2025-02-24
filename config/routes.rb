require 'devise'

Rails.application.routes.draw do
  devise_for :users
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root "home#index"

  resources :subjects do
    resources :skills do
      resources :practice_sessions, only: [:create]
    end
  end

  resources :practice_sessions do
    member do
      patch :reschedule
    end
  end

  get 'today', to: 'today#index', as: :today
  get 'how-it-works', to: 'how_it_works#index', as: :how_it_works

  namespace :api do
    resources :skills do
      member do
        post 'rate'
        post 'reset_start_date'
      end
      resources :practice_sessions, only: [:create]
    end
    resources :practice_sessions, only: [] do
      member do
        post 'rate'
      end
    end
    post '/practice_sessions/:id/rate', to: 'practice_sessions#rate'
  end

  get '/calendar', to: 'calendar#index'
  post '/add_skill', to: 'home#add_skill'
end
