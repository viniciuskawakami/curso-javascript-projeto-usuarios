/*jshint esversion: 6 */
class UserController {
	
	constructor(formCreateId, formUpdateId, tableId){
		this.formCreateEl = document.getElementById(formCreateId);
		this.formUpdateEl = document.getElementById(formUpdateId);
		this.tableEl = document.getElementById(tableId);
		
		this.onSubmit();
		this.onEdit();
		this.showAllUsers();
	} // ! constructor
	
	onEdit(){
		document.querySelector('.box-user-update .btn-cancel').addEventListener("click", e => {
			this.showPanelCreate();
		});
		
		this.formUpdateEl.addEventListener('submit', event => {
			event.preventDefault();
			let btn = this.formUpdateEl.querySelector('[type=submit]');
			let values = this.getValues(this.formUpdateEl);
			let index = this.formUpdateEl.dataset.trIndex;
			let tr = this.tableEl.rows[index];

			btn.disabled = true;

			if (!values) {
				btn.disabled = false;
				return false;
			}
			
			let valuesOld = JSON.parse(tr.dataset.user);
			let valuesNew = Object.assign({}, valuesOld, values);
			
			this.getPhoto(this.formUpdateEl).then((content) => {
				if(!values.photo) {
					valuesNew._photo = valuesOld._photo;
				} else {
					valuesNew._photo = content;
				}
				
				let user = new User();
				user.loadFromJSON(valuesNew);
				user.save();
				this.getTr(user, tr);
				this.updateCount();
				this.formUpdateEl.reset();
				btn.disabled = false;
				this.showPanelCreate();
			},
			(e) => {
				console.error(e);
			});
		});
	}
	onSubmit(){
		this.formCreateEl.addEventListener('submit', event => {
			event.preventDefault();
			let btn = this.formCreateEl.querySelector('[type=submit]');
			let values = this.getValues(this.formCreateEl);
			let user = new User();
			btn.disabled = true;
			
			if (!values) {
				btn.disabled = false;
				return false;
			}
			
			this.getPhoto(this.formCreateEl).then((content) => {
				values.photo = content;
				values.save();
				this.addLine(values);
				this.formCreateEl.reset();
				btn.disabled = false;
			},
			(e)=>{
				console.error(e);
			});
		});
	} // ! onSubmit
	
	getPhoto(formEl){
		return new Promise((resolve, reject)=>{
			let fileReader = new FileReader();
			let elements = [...formEl.elements].filter(item=>{
				if (item.name === 'photo') {
					return item;
				}
			});
			let file = elements[0].files[0];
			
			fileReader.onload = ()=>{
				resolve(fileReader.result);
			};
			
			fileReader.onerror = (e)=>{
				reject(e);
			};
			
			if (file) {
				fileReader.readAsDataURL(file);
			} else {
				resolve('dist/img/boxed-bg.jpg');
			}
		});
		
	}
	getValues(formEl){
		let user = {};
		let fields = formEl.elements;
		let isValid = true;
		/* podemos usar o operador Spread (...) - que sao reticências - para tornar esse 
		* objeto em um array já que a função forEach() é uma função para arr[]
		* [...fields].forEach
		*/
				
		[...fields].forEach(function (field, index) {
			if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
				field.parentElement.classList.add('has-error');
				isValid = false;;
			}
			if (field.name == 'gender') {
				if (field.checked) {
					user[field.name] = field.value;
				}
			} else if (field.name == 'admin') {
				user[field.name] = field.checked;
			} else {
				user[field.name] = field.value;
			}
		});
		
		// for (let i = 0; i < fields.length; i++) {
		// 	if (fields[i].name == 'gender') {
		// 		if (fields[i].checked) {
		// 			user[fields[i].name] = fields[i].value;
		// 		}
		// 	} else if (fields[i].name == 'admin') {
		// 		if (fields[i].checked) {
		// 			user[fields[i].name] = fields[i].value;
		// 		} else {
		// 			user[fields[i].name] = 'N';
		// 		}
		// 	} else {
		// 		user[fields[i].name] = fields[i].value;
		// 	}
		// }
		
		if (!isValid) {
			return false;
		}
		
		return new User(
			user.name,
			user.gender,
			user.birth,
			user.country,
			user.email,
			user.password,
			user.photo,
			user.admin
		);
	} // ! getValues
		
	showAllUsers(){
		let users = User.getUsersStorage();
		
		users.forEach(dataUser => {
			let user = new User();
			
			user.loadFromJSON(dataUser);
			
			this.addLine(user);
		});
	}
	
	addLine(dataUser) {
		let tr = this.getTr(dataUser);

		this.tableEl.appendChild(tr);
		this.updateCount();

	} // ! addLine
	
	getTr(dataUser, tr = null){
		if (tr === null) tr = document.createElement('tr');
		
		tr.dataset.user = JSON.stringify(dataUser);		
		
		tr.innerHTML = `
			<td>
				<img src="${dataUser.photo}" alt="UserImage" class="img-circle img-sm">
			</td>
			<td>${dataUser.name}</td>
			<td>${dataUser.email}</td>
			<td>${(dataUser.admin) ? 'SIM' : 'NÃO'}</td>
			<td>${Utils.dateFormat(dataUser.register, 'd/m/Y H:i:s')}</td>
			<td>
				<button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
				<button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
			</td>
		`;
		
		this.addEventsTr(tr);
		
		return tr;
	}
	
	addEventsTr(tr){
		tr.querySelector('.btn-delete').addEventListener("click", e => {
			if (confirm('Deseja realmente excluir?')) {
				let user = new User();
				
				user.loadFromJSON(JSON.parse(tr.dataset.user));
				
				user.remove();
				
				tr.remove();
				
				this.updateCount();
			}
		});
		
		tr.querySelector('.btn-edit').addEventListener("click", e => {
			let json = JSON.parse(tr.dataset.user);
			
			this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

			for (let name in json) {
				let field = this.formUpdateEl.querySelector('[name=' + name.replace("_", "") + ']');

				if (field) {
					switch (field.type) {
						case 'file':
							continue;
							break;
						case 'radio':
							field = this.formUpdateEl.querySelector('[name=' + name.replace("_", "") + '][value=' + json[name] + ']');
							field.checked = true;
							break;
						case 'checkbox':
							field.checked = json[name];
							break;
						default:
							field.value = json[name];
					}
				}

			}
			this.formUpdateEl.querySelector('.photo').src = json._photo;
			this.showPanelUpdate();
		});
	}
	
	showPanelCreate(){
		document.querySelector('.box-user-create').style.display = 'block';
		document.querySelector('.box-user-update').style.display = 'none';
	}
	
	showPanelUpdate(){
		document.querySelector('.box-user-create').style.display = 'none';
		document.querySelector('.box-user-update').style.display = 'block';
	}
	
	updateCount(){
		let numberUsers = 0;
		let numberAdmins = 0;
		
		[...this.tableEl.children].forEach(tr=>{
			numberUsers++;
			let user = JSON.parse(tr.dataset.user);
			if(user._admin) numberAdmins++;
		});
		
		document.querySelector('#number-users').innerHTML = numberUsers;
		document.querySelector('#number-users-admin').innerHTML = numberAdmins;
	}
}