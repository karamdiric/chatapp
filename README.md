# CHAT_APP

# Real-Time Chat Application

A modern real-time chat application built with Ruby on Rails, featuring real-time messaging, file sharing, and user authentication.

## Versions
* Ruby: 3.2.2
* Ruby On Rails 8.0.2 

## Features

- Real-time messaging using Action Cable
- User authentication with Devise
- File sharing (images, videos, documents)
- Chatroom management
- Message broadcasting
- Modern UI with Tailwind CSS

## Tech Stack

- Ruby on Rails 8.0
- MySQL (utf8mb4)
- Action Cable for WebSocket
- Devise for authentication
- Active Storage for file attachments
- Tailwind CSS for styling
- Turbo Streams for real-time updates

## Database Schema

### Users
- `email`: string (unique, required)
- `encrypted_password`: string (required)
- `reset_password_token`: string
- `reset_password_sent_at`: datetime
- `remember_created_at`: datetime
- `created_at`: datetime
- `updated_at`: datetime

### Chatrooms
- `name`: string (unique, required)
- `description`: text (required)
- `user_id`: bigint (foreign key, required)
- `created_at`: datetime
- `updated_at`: datetime

### Messages
- `content`: text (required unless media is attached)
- `user_id`: bigint (foreign key, required)
- `chatroom_id`: bigint (foreign key, required)
- `created_at`: datetime
- `updated_at`: datetime

## Models

### User Model
- Uses Devise for authentication
- Has one attached avatar
- Has many messages and chatrooms
- Validates email uniqueness and presence
- Validates encrypted password presence

### Chatroom Model
- Belongs to a user (creator)
- Has many messages
- Has many users through messages
- Validates name presence and uniqueness
- Validates description presence
- Ordered by creation date (newest first)

### Message Model
- Belongs to a user and chatroom
- Has one attached media
- Supports various file types:
  - Images (JPEG, PNG, GIF, SVG, WebP, HEIC, HEIF)
  - Videos (MP4, QuickTime, AVI, WMV, WebM, OGG)
  - Documents (PDF, DOC, DOCX)
- Maximum file size: 30MB
- Real-time broadcasting using Action Cable
- Ordered by creation date (oldest first)

## Controllers

### ChatroomsController
- Requires user authentication
- Actions:
  - `index`: List all chatrooms
  - `show`: Display chatroom and its messages
  - `new`: Create new chatroom form
  - `create`: Create new chatroom
  - `edit`: Edit chatroom form
  - `update`: Update chatroom
  - `destroy`: Delete chatroom
- Only allows owners to edit/delete their chatrooms

### MessagesController
- Requires user authentication
- Actions:
  - `create`: Create new message
  - `destroy`: Delete message
- Real-time broadcasting of message actions
- Only allows users to delete their own messages

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   bundle install
   yarn install
   ```
3. Set up the database:
   ```bash
   rails db:create
   rails db:migrate
   ```
4. Start the development server:
   ```bash
   ./bin/dev
   ```

## Development

The application uses:
- `Procfile.dev` for running both Rails and Tailwind CSS processes
- Docker for containerization
- GitHub Actions for CI/CD
- Rubocop for code style enforcement

## Security

- User authentication required for all actions
- File upload restrictions:
  - Size limit: 30MB
  - Allowed file types strictly enforced
- CSRF protection enabled
- Modern browser requirements enforced

## Real-time Features

- Message broadcasting using Action Cable
- Turbo Streams for real-time updates
- WebSocket connections for instant messaging
- Background job processing for message broadcasting

## File Storage

- Uses Active Storage for file attachments
- Supports multiple file types
- Automatic file validation and cleanup
- Secure file handling


# Run all tests
rails test

# Run specific test files
rails test test/models/user_test.rb
rails test test/controllers/chatrooms_controller_test.rb
rails test test/system/chatrooms_test.rb

# Run tests in parallel
rails test:parallel



## License

This project is licensed under the MIT License.
