/*jshint esversion: 6 */
class User {
	
	constructor(name, gender, birth, country, email, password, photo, admin){
		
		this._id;
		this._name = name;
		this._gender = gender;
		this._birth = birth;
		this._country = country;
		this._email = email;
		this._password = password;
		this._photo = photo;
		this._admin = admin;
		this._register = new Date();
		
	}
	
	get id(){
		return this._id;
	}
	get name(){
		return this._name;
	}
	get gender(){
		return this._gender;
	}
	get birth(){
		return this._birth;
	}
	get country(){
		return this._country;
	}
	get email(){
		return this._email;
	}
	get password(){
		return this._password;
	}
	get photo(){
		return this._photo;
	}
	get admin(){
		return this._admin;
	}
	get register(){
		return this._register;
	}
	
	
	set name(value) {
		this._name = value;
	}
	set gender(value) {
		this._gender = value;
	}
	set birth(value) {
		this._birth = value;
	}
	set country(value) {
		this._country = value;
	}
	set email(value) {
		this._email = value;
	}
	set password(value) {
		this._password = value;
	}
	set photo(value) {
		this._photo = value;
	}
	set admin(value) {
		this._admin = value;
	}
	set register(value) {
		this._register = value;
	}
	
	loadFromJSON(json){
		for (let name in json){
			switch (name) {
				case '_register':
					this[name] = new Date(json[name]);
					break;
				default:
					this[name] = json[name];
			}
		}
	}
	
	static getUsersStorage() {
		let users = [];

		if (localStorage.getItem("users")) {
			users = JSON.parse(localStorage.getItem("users"));
		}
		
		return users;
	}
	
	getNewId(){
		let uid = localStorage.getItem("users-uid");
		
		if (!uid && uid > 0) uid = 0;
			
		uid++;
		
		localStorage.setItem("users-uid", uid);
				
		return uid;
	}
	
	save(){
		let users = User.getUsersStorage();
		
		if (this.id > 0){
			users.map(u => {
				if (parseInt(u._id) === parseInt(this.id)) {
					Object.assign(u, this);
				}
				return u;
			});	
		} else {
			this._id = this.getNewId();
			users.push(this);
		}
		
		localStorage.setItem("users", JSON.stringify(users));

	}
	
	remove(){
		let users = User.getUsersStorage();
		
		users.forEach((userData, index) => {
			console.warn('tid: ',this._id, 'uid: ',userData._id);
			
			if (parseInt(this._id) === parseInt(userData._id)) {
				users.splice(index, 1);
				console.warn('indx: ',index, 'ud: ', userData);
			}
		});
		
		localStorage.setItem("users", JSON.stringify(users));
	}
}