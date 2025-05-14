module AvatarHelper
    def user_avatar(user, size = 80)
      if user.avatar.attached?
        user.avatar
      else
        gravatar_url(user.email, size)
      end
    end
    
    def gravatar_url(email, size)
      gravatar_id = Digest::MD5.hexdigest(email.downcase)
      "https://secure.gravatar.com/avatar/#{gravatar_id}?s=#{size}&d=identicon"
    end
  end