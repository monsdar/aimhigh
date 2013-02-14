

////////////////////////////////////////////////////////
//      Global variables
////////////////////////////////////////////////////////



$(document).ready( function () {
    
    ////////////////////////////////////////////////////////
    //      Initialization of the page
    ////////////////////////////////////////////////////////
        
    //TODO: This is not elegant, we should change the design to support async queries
    $.ajaxSetup({async:false});
    
    //This checks if the user exists or if a new one must be created (via redirect)
    if($.getUserkey() == '')
    {
        //The following code redirects to the new users page...
        //Perhaps there is a better way to load the URL for a new user,
        //but I couldn't find it...
        var randomMd5 = md5( Math.random().toString() );
        window.location.replace("http://aimhigh2.nilsbrinkmann.com/" + randomMd5);
        return;
    }
    
    //call the user, it will be created if not already existing
    var postVars = {userkey: $.getUserkey(), request: 'touchUser'};
    $.post($.getInterfaceUrl(), postVars, function(data) {
        console.log("Touched the user, received the following response: " + data);
    });
    
    //setup the Datepicker
    var dateStr = $.getDateString(new Date());
    console.log("Build the following date: " + dateStr);
    $("#selectedDate").val( dateStr );
    
    //update the categories/tasks
    $.refreshTasks();
});

///////////////////////////////////////
//   Events
///////////////////////////////////////
$(document).on('mouseenter', '.task', function() {
    $(this).addClass('linkPointer');
    $(this).find('h3').addClass('underlined');
});
$(document).on('mouseleave', '.task', function() {
    $(this).removeClass('linkPointer');
    $(this).find('h3').removeClass('underlined');
});

$(document).on('swipeleft swiperight', '.task', function() {
    //Open Edit/Delete dialog
    $.mobile.changePage($('#editTask'), {transition: 'pop', role: 'dialog'});
});

$(document).on('mouseenter', '.taskMoreLink', function() {
    $(this).addClass('underlined');
});
$(document).on('mouseleave', '.taskMoreLink', function() {
    $(this).removeClass('underlined');
});
$(document).on('tap', '.taskMoreLink', function(event) {
    event.stopPropagation();
    
    //store the current task into the window-cache (global cache)
    //this is needed for allowing the dialog communicate with the page
    window.selectedTask = $(this).closest('.task');
    window.selectedCategory = $(this).closest('.category').find('.catName').text();    
    
    //Open Edit/Delete dialog
    $.mobile.changePage($('#editTask'), {transition: 'pop', role: 'dialog'});
});

$(document).on('mouseenter', '.task', function() {
    $(this).find('.moreDiv').append("<a href='#' class='taskMoreLink'>More</a>");
});
$(document).on('mouseleave', '.task', function() {
   $('.taskMoreLink').remove();
});
$(document).on('tap', '.task', function() {
    var task = $(this);
    
    //set the new state
    var classList = task.attr('class').split(/\s+/);
    $.each( classList, function(index, item){
        if ( item === 'positiveTask') {
           task.removeClass('positiveTask').addClass('positiveTaskDone');
           task.find('.streak').text( $.increaseStreak(task.find('.streak').text()) );
        }
        else if ( item === 'positiveTaskDone') {
           task.removeClass('positiveTaskDone').addClass('positiveTask');
           task.find('.streak').text( $.decreaseStreak(task.find('.streak').text()) );
        }
        else if ( item === 'negativeTask') {
           task.removeClass('negativeTask').addClass('negativeTaskDone');
           task.find('.streak').text( $.increaseStreak(task.find('.streak').text()) );
        }
        else if ( item === 'negativeTaskDone') {
           task.removeClass('negativeTaskDone').addClass('negativeTask');
           task.find('.streak').text( $.decreaseStreak(task.find('.streak').text()) );
        }
    });

    //de/activate the task in the DB
    var taskId = task.attr('id').split('-')[1];
    var selectedDate = $.getCurrentDate();
    console.log("Toggling for the following date: " + selectedDate);
    var postVars = {userkey: $.getUserkey(), request: 'toggleTask', taskid: taskId, date: selectedDate};
    $.post($.getInterfaceUrl(), postVars, function(data) {
        console.log("Toggled task #" + taskId + ", received the following response: " + data);
    });

    //update the score
    $.updateScore();
    
    //TODO: Refresh statistics
});


$(document).on('change', '#selectedDate', function() {
    var dateEdit = $('#selectedDate');
    if(dateEdit.val() == '') {
        dateEdit.val( $.getDateString(new Date()) );
    }
    
    console.log("Date changed to " + $('#selectedDate').val() );
    
    //update the categories/tasks
    $.refreshTasks();
});

$(document).on('click', '#newTaskSubmit', function() {
    var page = $(this).closest('#createTask');
    var title = page.find('#createTitle').val();
    var text = page.find('#createText').val();
    var category = page.find('#createCategory').val();
    var isNegative = page.find('#createIsNegative').val();
    
    if(isNegative == 'positive') {
        isNegative = 0;
    }
    else {
        isNegative = 1;
    }
    
    //create the task, refresh the tasks after that
    $.createTask(title, text, category, isNegative);
});

$(document).on('pageinit', '#editTask', function() {
    var task = window.selectedTask;
    var category = window.selectedCategory;
    var dialog = $(this);
    
    //TODO: Fill in if the task is negative or not
    
    dialog.find('#editTitle').val( task.find('.taskTitle').text() );
    dialog.find('#editText').val( task.find('.taskText').text() );
    dialog.find('#editCategory').val( category );
});

$(document).on('click', '#editTaskSubmit', function() {
    var page = $(this).closest('#editTask');
    var taskId = $.getTaskId(window.selectedTask);
    var title = page.find('#editTitle').val();
    var text = page.find('#editText').val();
    var category = page.find('#editCategory').val();
    var isNegative = page.find('#editIsNegative').val();
    
    if(isNegative == 'positive') {
        isNegative = 0;
    }
    else {
        isNegative = 1;
    }
    
    //edit the task, refresh the tasks after that
    $.editTask(taskId, title, text, category, isNegative);
});

$(document).on('click', '#deleteTaskSubmit', function() {    
    var task = window.selectedTask;
    var id = $.getTaskId(task);
    
    //delete the task, refresh the tasks after that
    $.deleteTask(id);
});

///////////////////////////////////////
//   Specific Extensions
///////////////////////////////////////
$.extend({
    //Returns the userkey-portion of the URL
    //Returns '' if a file is given (the given URL contains '.' at the end))
    getUserkey: function(){
         var urlParts = window.location.href.split('/');
         var userkey = urlParts[ urlParts.length - 1 ];
         
         //don't return a user if a page is selected
         //NOTE: Why do we implement that? Does this ever happen?
         if(userkey.indexOf('.') !== -1) {
             userkey = '';
         }
         
         //don't return any GET-variables
         if(userkey.indexOf('#') !== -1) {
             userkey = userkey.split('#')[0];
         }
         
         return userkey;
    },
    
    //returns the taskId of a given task
    getTaskId: function(task) {
        return task.attr('id').split('-')[1];
    },
    
    //queries and returns the tasks of the given user
    refreshTasks: function() {
        var postVars = {userkey: $.getUserkey(), request: 'getTasks'};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            var tasks = $.parseJSON(data);
            
            console.log("getTasks() received the following tasks:");
            console.log(tasks);
            
            //refresh everything
            $('#categories').showTasks(tasks, $.getCurrentDate());
        });
    },

    //deletes a task by its taskId
    deleteTask: function(taskId) {
        var postVars = {userkey: $.getUserkey(), request: 'removeTask', taskid: taskId};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Removed task #" + taskId + ", received the following response: " + data);
            
            //update the categories/tasks
            $.refreshTasks();
        });
    },
    
    //edits a given task
    editTask: function(taskId, title, text, category, isNegative) {
        //send the interface that the task should be created
        var postVars = {userkey: $.getUserkey(), request: 'updateTask', taskid: taskId, title: title, text: text, category: category, isnegative: isNegative};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Edited task " + taskId + ", received the following response: ");
            console.log(data);
            
            //update the categories/tasks
            $.refreshTasks();
        });
    },
    
    //creates a task
    createTask: function(title, text, category, isNegative) {
        //send the interface that the task should be created
        var postVars = {userkey: $.getUserkey(), request: 'createTask', title: title, text: text, category: category, isnegative: isNegative};
        $.post($.getInterfaceUrl(), postVars, function(data) {
            console.log("Created new task, received the following response: ");
            console.log(data);
            
            //update the categories/tasks
            $.refreshTasks();
        });
    },
    
    getInterfaceUrl: function() {
        return "http://aimhigh2.nilsbrinkmann.com/interface/interface.php";
    },
    
    //Returns the given date as a string (yy-mm-dd)
    getDateString: function(givenDate) {
        return givenDate.getFullYear() + "-" + $.pad2(givenDate.getMonth()+1) + "-" + $.pad2(givenDate.getDate());  
    },
    
    //Returns the currently selected date (string in form yy-mm-dd)
    getCurrentDate: function(){
        var date = $('#selectedDate').val();
        return date;
    },
    
    //Subtracts x days from the given date (yy-mm-dd)
    subtractDays: function(currentDate, days) {
        var utc = Date.parse(currentDate);
        var date = new Date(utc - (1000 * 60 * 60 * 24 * days));
        return $.getDateString(date);       
    },
    
    //Returns if the given task is currently activated
    getActivationState: function(task) {
        var currentDate = $.getCurrentDate();
        var result = false;
        $.each(task.activations, function(i, act) {
            if(act.date == currentDate){
                result = true;
            }   
        });
        return result;
    },
    
    //increases a given streak by 1 (Format: Streak+n)
    increaseStreak: function(givenStreak) {
        if(givenStreak == '') {
            return 'Streak+1';
        }
        
        var parts = givenStreak.split('+');
        var newStreak = 'Streak+' + (parseInt(parts[1]) + 1);
        
        console.log("Increasing streak of <" + givenStreak + "> to <" + newStreak + ">");
        return newStreak;
    },
    //decreases a given streak by 1 (Format: Streak+n)
    decreaseStreak: function(givenStreak) {
        if(givenStreak == 'Streak+1') {
            return '';
        }
        else if(givenStreak == '') {
            return '';
        }
        
        var parts = givenStreak.split('+');
        var newStreak = 'Streak+' + (parseInt(parts[1]) - 1);
        
        console.log("Decreasing streak of <" + givenStreak + "> to <" + newStreak + ">");
        return newStreak;
    },
    
    //Returns the current streak as a string "Streak+5"
    getStreak: function(task) {
        var currentDate = $.getCurrentDate();
        var streak = 0;
        var todayBonus = 0;
        
        //let's search for the current date
        $.each(task.activations, function(i, act) {
            if(act.date == currentDate) {
                todayBonus = 1;
            }
        });
        
        //now we get backwards in time until we cannot find an activation
        while(true) {
            currentDate = $.subtractDays(currentDate, 1);
            var dateFound = false;
            $.each(task.activations, function(index, act) {
                if(act.date == currentDate) {
                    streak += 1;
                    dateFound = true;
                }
            });
            
            //if no activation could be found
            if(!dateFound) {
                break;
            }
        }
        
        if(streak + todayBonus <= 0){
            return "";
        }
        
        return "Streak+" + (streak + todayBonus);
    },
    
    updateScore: function() {
        var score = $('#score');
        var numNegative = $('#categories').find('.negativeTaskDone').length;
        var numPositive = $('#categories').find('.positiveTaskDone').length;
        score.text( numPositive - numNegative);
    }
});


///////////////////////////////////////
//   Common Extensions
///////////////////////////////////////
$.extend({
    pad2: function(number) {
        return (number < 10 ? '0' : '') + number;
    }
});

///////////////////////////////////////
//   Custom functions
///////////////////////////////////////
$.fn.showTasks = function(tasks, date) {
    //let's store the container into a variable, so that we can use it later
    //it seems as if javascript is overwriting the this-pointer somewhere in $.each
    var categories = $(this);
    
    //let's log the date which we're going to show
    console.log('Refreshing tasks for the following date: ' + date);
        
    //clean up the calling element
    categories.empty();    
    
    //gather the categories
    var givenCategories = [];
    $.each(tasks, function(i, item)
    {
        var currentCat = item.category;
        if( $.inArray(currentCat, givenCategories) == -1 )
        {
            givenCategories.push(currentCat);
        }
    });
    console.log('Found the following categories: ');
    console.log(givenCategories);   
    
    //add the category-divs
    $.each(givenCategories, function(i, cat) {
        var newCat = "";
        newCat += "<div class='category'>";
        newCat +=   "<h3 class='catName' >" + cat + "</h3>";
        newCat +=   "<ul data-role='listview' class='catList' id='" + cat + "List'></ul>";
        newCat += "</div>";
        categories.append(newCat);
    });
    
    //add the tasks to the categories
    $.each(tasks, function(i, task) {
        
        //calculate the streak
        var streak = $.getStreak(task);
        
        //get activation-state
        var isActivated = $.getActivationState(task);
        
        var type = 'positiveTask';
        if(task.isNegative == '1' && !isActivated) {
            type = 'negativeTask';    
        }
        else if(task.isNegative == '1' && isActivated) {
            type = 'negativeTaskDone';    
        }
        else if(task.isNegative == '0' && isActivated) {
            type = 'positiveTaskDone';    
        }        
        
        var newTask = "";
        newTask +=  "<li class='task " + type + "' id='task-" + task.index + "'>";
        newTask +=      "<div class='ui-grid-a'>";
        newTask +=          "<div class='ui-block-a'><h3 class='taskTitle'>" + task.title + "</h3></div>";
        newTask +=          "<div class='ui-block-b text-right streak'>" + streak + "</div>";
        newTask +=      "</div>";
        newTask +=      "<div class='ui-grid-a'>";
        newTask +=          "<div class='ui-block-a' style='width:85%;'><p class='taskText' style='padding:3px;'>" + task.text + "</p></div>";
        newTask +=          "<div class='ui-block-b text-right moreDiv' style='width:15%;'></div>";
        newTask +=      "</div>";
        newTask +=  "</li>";
        $('#' + task.category + 'List').append(newTask);
    });
    
    //refresh the page (this causes jQuery Mobile to update the UI elements)
    $('#mainPage').trigger('create');
    $.updateScore();
}

