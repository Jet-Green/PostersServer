class UserDto {
    email; firstname; lastname; phone; roles; posters; subscription; _id;contracts;managerIn;
    constructor(user) {
        const { email, firstname, lastname, phone, roles, posters, subscription, _id, contracts,managerIn } = user
        this.email = email;
        this.firstname = firstname;
        this.lastname = lastname;
        this.phone = phone;
        this.roles = roles;
        this.posters = posters;
        this.subscription = subscription;
        this._id = _id
        this.contracts = contracts
        this.managerIn = managerIn
    }
}

module.exports = UserDto