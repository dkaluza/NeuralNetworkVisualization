def auth_init(jwt):
    @jwt.user_loader_callback_loader
    def user_loader_callback(identity):
        return identity
