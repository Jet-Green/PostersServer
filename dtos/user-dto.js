class UserDto {
    email; firstname; lastname; phone; roles; posters; subscription;
    constructor(user) {
        const { email, firstname, lastname, phone, roles, posters, subscription } = user
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.phone = phone;
        this.roles = roles;
        this.posters = posters;
        this.subscription = subscription;
    }
}

module.exports = UserDto