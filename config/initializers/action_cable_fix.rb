Rails.application.config.to_prepare do
    ActionCable::Server::Configuration.class_eval do
      attr_accessor :server_command_cleanup_job unless method_defined?(:server_command_cleanup_job=)
    end
  end