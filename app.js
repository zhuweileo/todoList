import Vue from "vue"
import AV from "leancloud-storage"

var APP_ID = 'MrORg855YNUhOJzu9SixFxUH-gzGzoHsz';
var APP_KEY = 'g03c1hVsSfuSjzTOeFWSJhPm';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});



var app = new Vue({
	el: "#app",
	data:{
		newTodo:"",
		todoList: [],
		actionType: "login",
		formData:{
			username:"",
			password:""
		},
		curUser:null
	}, 
	created:function (){
		this.getLists();
	},
	methods:{
		addone:function(){
			if(!this.newTodo) return;
			var time;
			var date = new Date();
			time = date.toLocaleDateString()+"/"+date.toLocaleTimeString();
			this.todoList.push({
				title:this.newTodo,
				creatTime:time,
				done:false
			});
			this.newTodo = "";
			this.saveOrUpdateTodos();
		},
		deletone:function(todo){
			let index = this.todoList.indexOf(todo);
			this.todoList.splice(index,1);
			this.saveOrUpdateTodos();
		},
		signUp:function () {
		    let user = new AV.User();
		    user.setUsername(this.formData.username);
		    user.setPassword(this.formData.password);
		    user.signUp().then((loginedUser) =>{
		      this.getLists();
		    }, function (error) {
		    	alert("signup faile");
		    });

		},
		login:function(){
		    AV.User.logIn(this.formData.username, this.formData.password).then((loginedUser) =>{
		       this.getLists();     
		    }, function (error) {
		    	console.log("login faile");
		    });
		},
		getCurUser:function(){
			let cur = AV.User.current();
			if(cur){
				let {id,createdAt,attributes:{username}} = cur;
				return {id,username,createdAt};
			}else{
				return null;
			}
			
		},
		signOut:function(){
			AV.User.logOut();
			this.curUser = this.getCurUser();
		},
		saveTodos:function () {
			console.log(1);
			let dataString = JSON.stringify(this.todoList);
			var AvTodo = AV.Object.extend("AllTodos");
			var avtodo = new AvTodo();

			var acl = new AV.ACL();
			acl.setReadAccess(AV.User.current(),true);
			acl.setWriteAccess(AV.User.current(),true);

			avtodo.setACL(acl);
			avtodo.set("content",dataString);
			avtodo.save().then((todo)=>{
				this.todoList.id = todo.id;
				console.log("success");
			},function(error){
				console.log("fail");
			})
		},
		updateTodos:function () {
			let dataString = JSON.stringify(this.todoList);
			let avTodos = AV.Object.createWithoutData("AllTodos",this.todoList.id);
			avTodos.set("content",dataString);
			avTodos.save().then(function(){
				console.log("更新成功");
			})
		},
		saveOrUpdateTodos:function () {
			if(this.todoList.id){
				this.updateTodos();
			}else{
				this.saveTodos();
			}
		},
		getLists:function () {
			this.curUser = this.getCurUser();
			if(this.curUser){
				var query = new AV.Query("AllTodos");
				query.find().then( (todos)=>{
					console.log(todos);
					var todo = todos[0];
					console.log(todo);
					if(todo){
						this.todoList= JSON.parse(todo.attributes.content)
					}else{
						console.log(1);
						this.todoList=[];
					}
					// debugger;
					var id = todo.id;
					console.log(todo);
					// debugger;

					
					
					this.todoList.id = id;
	            },function(){

				})
			} 
		}

	}
})