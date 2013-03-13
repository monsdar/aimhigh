
//This file has dependencies to
//  util.js

$.extend({
    
    //Returns the URL to the PHP interface
    getInterfaceUrl: function() {
        return "http://" + document.domain + '/' + "interface/interface.php";
    },
    
    //Touches the user, gets the userkey via getUserKey
    //After the data is received and the user is new, it will call the callbacks
    //  callback(isNewUser);
    touchUser: function(callbacks) {
        //call the user, it will be created if not already existing
        var postVars = {userkey: $.getUserkey(), request: 'touchUser'};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Touched the user, received the following response: " + data);
            var answer = $.parseJSON(data);
            
            //call the callbacks
            $.each( callbacks, function(i, callback) {
                callback(answer);
            });
        });
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
    //After the data is received it will call the given callback via
    //  callback();
    toggleTask: function(taskId, selectedDate, callbacks) {
        var postVars = {userkey: $.getUserkey(), request: 'toggleTask', taskid: taskId, date: selectedDate};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Toggled task #" + taskId + ", received the following response: " + data);
            
            //call the callbacks
            $.each( callbacks, function(i, callback) {
                callback();
            });
        });
    },

    //deletes a task by its taskId
    //After the data is received it will call the given callback via
    //  callback();
    deleteTask: function(taskId, callbacks) {
        var postVars = {userkey: $.getUserkey(), request: 'removeTask', taskid: taskId};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Removed task #" + taskId + ", received the following response: " + data);
            
            //call the callbacks
            $.each( callbacks, function(i, callback) {
                callback();
            });
        });
    },
    
    //edits a given task
    //After the data is received it will call the given callback via
    //  callback();
    editTask: function(taskId, title, text, category, isNegative, offdays, callbacks) {
        //send the interface that the task should be created
        var postVars = {userkey: $.getUserkey(), request: 'updateTask', taskid: taskId, title: title, text: text, category: category, isnegative: isNegative, offdays: offdays};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Edited task " + taskId + ", received the following response: " + data);
            
            //call the callbacks
            $.each( callbacks, function(i, callback) {
                callback();
            });
        });
    },
    
    //creates a task
    //After the data is received it will call the given callback via
    //  callback();
    createTask: function(title, text, category, isNegative, offdays, callbacks) {
        //send the interface that the task should be created
        var postVars = {userkey: $.getUserkey(), request: 'createTask', title: title, text: text, category: category, isnegative: isNegative, offdays: offdays};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Created new task, received the following response: " + data);
            
            //call the callbacks
            $.each( callbacks, function(i, callback) {
                callback();
            });
        });
    }    
});
