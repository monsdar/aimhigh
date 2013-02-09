
$.extend({
    //Returns the userkey-portion of the URL
    //Returns '' if a file is given (the given URL contains '.' at the end))
    getUserKey: function(){
         var urlParts = window.location.href.split('/');
         var userKey = urlParts[ urlParts.length - 1 ];
         if(userKey.indexOf('.') !== -1)
         {
             userKey = '';
         }
         return userKey;
    }
});

$.fn.updateScore = function(container) {
    var tasks = container.children('.task');
    var counter = 0;
    $.each(tasks, function(i, task) {
        var classList = $(task).attr('class');
        if (classList.indexOf('solvedTask') >= 0) {
            counter = counter + 1;
        }
    });
    $(this).text(counter);
}

$.fn.createTask = function(url, userkey, text) {
    //send the interface that the task should be created
    var postVars = {userkey: userkey, request: 'createTask', text: text};
    $.post(url, postVars, function(data) {
        console.log("Created new task, received the following response: ");
        console.log(data);
    });
}

$.fn.refreshTasks = function(url, userkey) {
    //let's store the object into a variable, so that we can use it in the $.each
    var category = $(this);
    var todayDate = new Date();
    var tomorrowDate = new Date(todayDate.getTime() + 24 * 60 * 60 * 1000);
    todayDate.setHours(0, 0, 0, 0);
    tomorrowDate.setHours(0, 0, 0, 0);
    var todayUTC = todayDate.getTime() / 1000;
    var tomorrowUTC = tomorrowDate.getTime() / 1000;
    
    //clean up the calling element
    category.empty();    
    
    //let's query the aimhigh-interface for content
    console.log("Refreshing the tasks!");
    var postVars = {userkey: userkey, request: 'getTasks'};
    $.post(url, postVars, function(data) {
        var json = $.parseJSON(data);
        $.each(json, function(i, item)
        {
            console.log('New Task: ' + item.text + '(' + item.index + ')');
            var taskActivated = '';
            $.each(item.activations, function(i, act) {
                if(act.timestamp >= todayUTC && act.timestamp < tomorrowUTC ) {
                    taskActivated = 'solvedTask';
                }       
            });
            category.append('<div class="task ' + taskActivated + '" id="#id-' + item.index + '"><p><a class="taskText">' + item.text + '</a></p></div>');
        });
    });
}


