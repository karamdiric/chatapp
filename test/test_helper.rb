ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "minitest/mock"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
    def sign_in(user)
      post user_session_path, params: {
        user: {
          email: user.email,
          password: "password123"
        }
      }
    end

    def sign_out(user)
      delete destroy_user_session_path
    end

    # Include ActiveJob test assertions
    include ActiveJob::TestHelper
  end
end

module ActionDispatch
  class IntegrationTest
    def sign_in(user)
      post user_session_path, params: {
        user: {
          email: user.email,
          password: "password123"
        }
      }
    end

    def sign_out(user)
      delete destroy_user_session_path
    end

    # Include ActiveJob test assertions
    include ActiveJob::TestHelper
  end
end
