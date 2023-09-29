class UserDto {
    email; firstname; lastname; phone; roles; posters; subscription; _id;contracts;
    constructor(user) {
        const { email, firstname, lastname, phone, roles, posters, subscription, _id, contracts } = user
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.phone = phone;
        this.roles = roles;
        this.posters = posters;
        this.subscription = subscription;
        this._id = _id
        this.contracts = contracts
    }
}

module.exports = UserDto