
//This file has dependencies to
//  util.js

//The following option sets jQuery to do sync requests (wait until an answer is received)
//We're using async callbacks, but the page is loading "cleaner", so I'll let this in here for first...
$.ajaxSetup({async:false});


$.extend({
    
    //Returns the URL to the PHP interface
    getInterfaceUrl: function() {
        return "http://" + document.domain + '/' + "interface/interface.php";
    },
    
    //Touches the user, gets the userkey via getUserKey
    //After the data is received and the user is new, it will call the callbacks
    //  callback();
    touchUser: function(callbacks) {
        //call the user, it will be created if not already existing
        var isNewUser = false;
        var postVars = {userkey: $.getUserkey(), request: 'touchUser'};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Touched the user, received the following response: " + data);
            var answer = $.parseJSON(data);
            if(answer === true) {
                isNewUser = true;
            }
        });
        return isNewUser;
    },
    
    //Queries and returns the tasks of the given user
    //After the data is received it will call the given callback via#
    //  callback(tasks);
    queryTasks: function(callbacks) {
        var tasks;
        var postVars = {userkey: $.getUserkey(), request: 'getTasks'};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            var tasks = $.parseJSON(data);
            console.log("queryTasks() received the following tasks:");
            console.log(tasks);
            
            //call the callbacks
            $.each( callbacks, function(i, callback) {
                callback(tasks);
            });
        });
    },
    
    //Toggles a given task
    toggleTask: function(taskId, selectedDate) {
        var postVars = {userkey: $.getUserkey(), request: 'toggleTask', taskid: taskId, date: selectedDate};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Toggled task #" + taskId + ", received the following response: " + data);
        });
    },

    //deletes a task by its taskId
    deleteTask: function(taskId) {
        var postVars = {userkey: $.getUserkey(), request: 'removeTask', taskid: taskId};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Removed task #" + taskId + ", received the following response: " + data);
        });
    },
    
    //edits a given task
    editTask: function(taskId, title, text, category, isNegative) {
        //send the interface that the task should be created
        var postVars = {userkey: $.getUserkey(), request: 'updateTask', taskid: taskId, title: title, text: text, category: category, isnegative: isNegative};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Edited task " + taskId + ", received the following response: " + data);
        });
    },
    
    //creates a task
    createTask: function(title, text, category, isNegative) {
        //send the interface that the task should be created
        var postVars = {userkey: $.getUserkey(), request: 'createTask', title: title, text: text, category: category, isnegative: isNegative};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Created new task, received the following response: " + data);
        });
    }    
});
