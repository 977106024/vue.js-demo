import  Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = 'm84m8zfw9TTQhpNnoTqCSo29-gzGzoHsz';
var APP_KEY = 'DGIkBzyabbK9aqz548Fnx6XY';

AV.init({
    appId: APP_ID,
    appKey: APP_KEY
});

var app;
app = new Vue({
    el: "#app",
    data: {
        newTodo: '',
        todoList: [],
        actionType: 'signUp',
        formData: {
            username: '',
            password: ''
        },
        currentUser: null
    },
    created:function(){

        this.currentUser = this.getCurrentUser();
        this.fetchTodos()//读取todos
    },
    methods:{
        fetchTodos:function(){
            if(this.currentUser){
                var query = new AV.Query('AllTodos')
                query.find()
                    .then((todos) => {
                        let avAllTodos = todos[0];
                        let id = avAllTodos.id;
                        this.todoList = JSON.parse(avAllTodos.attributes.content) //解析内容
                        this.todoList.id = id  //给数组设置id

                    },function(error){
                        console.log(error)
                    })
            }
        },
        updateTodos:function(){
            let dataString = JSON.stringify(this.todoList)
            let avTodos = AV.Object.createWithoutData('AllTodos',this.todoList.id)//更新对象

            avTodos.set('content',dataString)
            avTodos.save().then(() => {
                console.log('更新成功')
            })
        },
        saveTodos:function(){
            let dataString = JSON.stringify(this.todoList)

            var AVTodos = AV.Object.extend('AllTodos')
            var avTodos = new AVTodos()

            var acl = new AV.ACL()
            acl.setReadAccess(AV.User.current(),true)//只有这个用户能读
            acl.setWriteAccess(AV.User.current(),true)//只有这个用户能写

            avTodos.set('content',dataString)
            avTodos.setACL(acl) //设置访问控制 访问服务器？
            avTodos.save().then((todo) =>{
                this.todoList.id = todo.id
                console.log('保存成功')
            },function(error){
                alert('保存失败')
            })
        },
        saveOrUpdateTodos:function(){
            if(this.todoList.id){
                this.updateTodos()
            }else{
                this.saveTodos()
            }
        },
        addTodo:function(){
            // function changeTimeStyle(time){
            //     if(time<10){
            //         return '0'+time;
            //     }else{
            //         return time;
            //     }
            // }
            // let d=new Date();
            // let date=d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 '+d.getHours()+':'+changeTimeStyle(d.getMinutes())+':'+changeTimeStyle(d.getSeconds());
            this.todoList.push({
                title:this.newTodo,
                // createdAt:date,
                done:false
            })
            this.newTodo = ''
            this.saveOrUpdateTodos()
        },
        removeTodo:function(todo){
            var index = this.todoList.indexOf(todo)
            this.todoList.splice(index,1)
            this.saveOrUpdateTodos()//不能调用saveTodos 了
        },
        signUp:function(){
            let user = new AV.User();
            user.setUsername(this.formData.username);
            user.setPassword(this.formData.password);
            user.signUp().then((loginedUser) => {
                this.currentUser = this.getCurrentUser()
        },function(error){
                console.log('注册失败')
            });
        },
        login:function(){
            AV.User.logIn(this.formData.username,this.formData.password).then(loginedUser => {
                this.currentUser = this.getCurrentUser()
                this.fetchTodos()
            },function(error){
                alert('登录失败')
            })
        },
        getCurrentUser:function(){//获取当前用户
            let current = AV.User.current();
            if(current){
                let {id, createdAt, attributes: {username}} = current;
                return {id, username, createdAt};
            }else{
                return null;
            }
        },
        logout:function(){
            AV.User.logOut()//登出
            this.currentUser = null
            window.location.reload() //刷新当前页面
        }
    }

});