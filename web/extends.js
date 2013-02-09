
console.log("Extending jQuery with getUserKey()");
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

$.extend({
    //Returns the currently selected date (string in form yy-mm-dd)
    getCurrentDate: function(){
        return $('#dateEdit').val();
    } 
});

console.log("Extending jQuery with getActivations()");
$.extend({
    //Returns the summed up activations for the last x days
    getActivations: function(tasks, lastXDays) {
        //this object will be returned
        var dailyActivations = new Object();

        //prefill the activations with the requested dates
        var date = $.datepicker.parseDate('yy-mm-dd', $.datepicker.formatDate('yy-mm-dd', new Date()));
        date.setDate( date.getDate() - lastXDays ); //start from the first day
        for (var index=0; index<lastXDays; index++)
        { 
            date.setDate(date.getDate() + 1); //add a day
            var currentDate = $.datepicker.formatDate('yy-mm-dd', date)
            dailyActivations[ currentDate ] = 0;
        }

        //sum up the activations
        $.each(tasks, function(i, task) {
            $.each(task.activations, function(i, act) {
                if(act.date in dailyActivations)
                {
                    dailyActivations[act.date] = dailyActivations[act.date] + 1;
                    console.log('Another score for ' + act.date + ', now ' + dailyActivations[act.date]);
                }
            });
        });

        console.log(dailyActivations);
        return dailyActivations;
    }
});

console.log("Extending jQuery with getMaximum()");
console.log("Extending jQuery with getMinimum()");
$.extend({
    //Returns the maximum value from a given list
    getMaximum: function(items) {
        var maximum = 0;
        $.each(items, function(i, item) {
            if(item > maximum){
                maximum = item;
            }
        });
        return maximum;
    },
    
    //Returns the minimum value from a given list (must be lower than 0)
    getMinimum: function(items) {
        var minimum = 0;
        $.each(items, function(i, item) {
            if(item < minimum){
                minimum = item;
            }
        });
        return minimum;      
    }
})

console.log("Extending jQuery with getTasks()");
$.extend({
    //queries and returns the tasks of the given user
    getTasks: function(url, userkey) {
        var tasks;
        var postVars = {userkey: userkey, request: 'getTasks'};
        $.post(url, postVars, function(data) {
            tasks = $.parseJSON(data);
        });
        console.log("getTasks() received the following tasks:");
        console.log(tasks);
        return tasks;
    }
});

$.fn.drawChart = function(tasks) {
    var options = {};
    options.chart = { renderTo: $(this).attr('id'), type: 'line' };
    options.title = { text: 'Score History' };
    options.series = [];
        
    //push the activations into the graph
    var activations = $.getActivations(tasks, 7);
    console.log("drawChart() received the following acts: ");
    console.log(activations);
    var data = [];
    $.each(activations, function(i, act) {
        data.push(act);
    });
    console.log('Created data: ');
    console.log(data);
    options.series.push( { name: 'Daily Score', data: data } );
    
    //get the maximum score
    var maxScore = $.getMaximum(activations);
    var minScore = $.getMinimum(activations);
    
    options.yAxis = { title: { text: 'Score'}, allowDecimals: false, min: minScore, minTickInterval: 1, max: maxScore};
    options.xAxis = { title: { text: 'Time'}, allowDecimals: false, labels: { enabled: false }};
    
    return new Highcharts.Chart(options);
}

console.log("Defining function updateScore()");
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

console.log("Defining function createTask()");
$.fn.createTask = function(url, userkey, text) {
    //send the interface that the task should be created
    var postVars = {userkey: userkey, request: 'createTask', text: text};
    $.post(url, postVars, function(data) {
        console.log("Created new task, received the following response: ");
        console.log(data);
    });
}

console.log("Defining function showTasks()");
$.fn.showTasks = function(tasks, date) {
    //let's store the object into a variable, so that we can use it in the $.each
    var category = $(this);
    
    //let's log the date which we're going to show
    console.log('Refreshing tasks for the following date: ' + date);
        
    //clean up the calling element
    category.empty();    
    
    //let's display the tasks
    console.log("Refreshing the tasks!");
    $.each(tasks, function(i, item)
    {
        console.log('New Task: ' + item.text + '(' + item.index + ')');
        var taskActivated = '';
        $.each(item.activations, function(i, act) {
            if(act.date == date ) {
                taskActivated = 'solvedTask';
            }       
        });
        category.append('<div class="task ' + taskActivated + '" id="#id-' + item.index + '"><p><a class="taskText">' + item.text + '</a></p></div>');
    });
}


