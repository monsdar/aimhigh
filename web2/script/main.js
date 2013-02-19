

//////////////////////////////////////////////
//      Initialization of the page
//////////////////////////////////////////////
$(document).ready( function () {
    //This checks if the user exists or if a new one must be created (via redirect)
    if($.getUserkey() == '')
    {
        //The following code redirects to the new users page...
        //Perhaps there is a better way to load the URL for a new user,
        //but I couldn't find it...
        var randomMd5 = md5( Math.random().toString() );
        var userUrl = "http://" + document.domain + '/' + randomMd5;
        window.location.replace(userUrl);
        $('.bookmark').attr("href", userUrl);
        return;
    }
    
    //call the user, it will be created if not already existing
    $.touchUser();
    
    //setup the Datepicker
    var dateStr = $.getDateString(new Date());
    console.log("Build the following date: " + dateStr);
    $("#selectedDate").val( dateStr );
    
    //update the categories/tasks
    $.refreshCategories();
});

///////////////////////////////////////
//   Events
///////////////////////////////////////

//Visual effects when hovering over a task
$(document).on('mouseenter', '.task', function() {
    $(this).addClass('linkPointer');
    $(this).find('h3').addClass('underlined');
});

//Visual effects when hovering over a task
$(document).on('mouseleave', '.task', function() {
    $(this).removeClass('linkPointer');
    $(this).find('h3').removeClass('underlined');
});

//Prevents the ContextMenu from opening up if the user
//Clicks on a task with his right mouse button
$(document).on('contextmenu', '.task', function(event) {
    event.preventDefault();
});

//check if the right mouse button was pressed
//if so, open the EditDialog
$(document).on('mouseup', '.task', function(event) {
    if(event.which == 3) {
        $.openEditDialog($(this));
    }
});

//Opens the EditDialog if a TapHold is executed on a task
//
//After the Taphold a Tap-Event is usually triggered, so we need the
//global ignoreTaskTap-variable here
//If it's set, the Task.Tap event will not do anything
//
//If that workaround is not implemented, a Task would be de/activated everytime
//the user wants to edit it via taphold
var ignoreTaskTap = false;
$(document).on('taphold', '.task', function() {
    ignoreTaskTap = true;
    $.openEditDialog($(this));
});

//Toggles the activation of the tapped task
//See comment of Task.Taphold for some information about ignoreTaskTap
$(document).on('tap', '.task', function() {
    if(ignoreTaskTap) {
        ignoreTaskTap = false;
        return;
    }    
    
    var task = $(this);
    
    //set the new state
    var classList = task.attr('class').split(/\s+/);
    $.each( classList, function(index, item){
        if ( item === 'positiveTask') {
            task.removeClass('positiveTask').addClass('positiveTaskDone');
            $.addActivation(task.data("task"), $.getCurrentDate());
        }
        else if ( item === 'positiveTaskDone') {
            task.removeClass('positiveTaskDone').addClass('positiveTask');
            $.removeActivation(task.data("task"), $.getCurrentDate());
        }
        else if ( item === 'negativeTask') {
            task.removeClass('negativeTask').addClass('negativeTaskDone');
            $.addActivation(task.data("task"), $.getCurrentDate());
        }
        else if ( item === 'negativeTaskDone') {
            task.removeClass('negativeTaskDone').addClass('negativeTask');
            $.removeActivation(task.data("task"), $.getCurrentDate());
        }
    });

    //de/activate the task in the DB
    var taskId = task.attr('id').split('-')[1];
    var selectedDate = $.getCurrentDate();
    $.toggleTask(taskId, selectedDate);
    
    //update the classes
    $('#categories').updateTasks();
    
    //update the score
    $.updateScore();
});

//This checks if the Date has changed and shows the appropriate tasks/activations
$(document).on('change', '#selectedDate', function() {
    var dateEdit = $(this);
    if(dateEdit.val() == '') {
        dateEdit.val( $.getDateString(new Date()) );
    }
    console.log("Date changed to " + $('#selectedDate').val() );
    
    $('#categories').updateTasks();
});

//Updates the score before the dialog pops up
$(document).on('pagebeforeshow', '#pageStats', function() {
    console.log("Opened Statistics dialog");
    $("#graph").showGraph( $("#categories") );
});

//This clears the CreateTaskDialog before it shows up
$(document).on('pagebeforeshow', '#createTask', function() {
    console.log("Opened CreateTask dialog");
    var page = $(this);
    page.find('#createTitle').val('');
    page.find('#createText').val('');
    page.find('#createCategory').val('');
    page.find('#createIsNegative').val('positive');
});

//Creates a new Task from CreateTaskDialog
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
    $.refreshCategories();
});

//Initializes the EditTaskDialog with value from the selected task
$(document).on('pagebeforeshow', '#editTask', function() {
    console.log("Opened EditTask dialog");
    var task = window.selectedTask;
    var dialog = $(this);
    
    var isNegative = "positive";
    if(task.isNegative) {
        isNegative = "negative";
    }
    
    dialog.find('#editTitle').val( task.title );
    dialog.find('#editText').val( task.text );
    dialog.find('#editCategory').val( task.category );
    dialog.find('#editIsNegative').val( isNegative );
});

//Submits an edited task
$(document).on('click', '#editTaskSubmit', function() {
    var page = $(this).closest('#editTask');
    var taskId = window.selectedTask.index;
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
    $.refreshCategories();
});

$(document).on('click', '#deleteTaskSubmit', function() {
    var taskId = window.selectedTask.index;
    
    //delete the task, refresh the tasks after that
    $.deleteTask(taskId);
    $.refreshCategories();
});

///////////////////////////////////////
//  Extensions
///////////////////////////////////////
$.extend({
    //returns the taskId of a given task
    getTaskId: function(task) {
        return task.attr('id').split('-')[1];
    },
    
    //queries the interface for tasks and fills them into the categories-div
    refreshCategories: function() {
        var callback = function (tasks) {
            $('#categories').showTasks(tasks);
        };
        var callbacks = new Array();
        callbacks.push(callback);
        $.queryTasks(callbacks);  
    },
    
    openEditDialog: function(taskHtml) {
        //store the current task into the window-cache (global cache)
        //this is needed for allowing the dialog communicate with the page
        var taskId = "#" + taskHtml[0].id;
        window.selectedTask = $(taskId).data("task");
    
        //Open Edit/Delete dialog
        //TODO: Is it possible to give data to the dialog in any way?
        $.mobile.changePage($('#editTask'), {transition: 'pop', role: 'dialog'});  
    },
    
    addActivation: function(task, date) {
        //the activation.index is not important here
        var activation = {date: date, index: "0"};
        task.activations.push( activation );
    },
    
    removeActivation: function(task, date) {
        var id = -1;
        $.each(task.activations, function(index, act) {
            if(act.date == date) {
                id = index;
            }
        });
        
        if(id != -1) {
            task.activations.splice(id, 1);   
        }
    },
    
    //Returns the currently selected date (string in form yy-mm-dd)
    getCurrentDate: function(){
        var date = $('#selectedDate').val();
        return date;
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
    
    //Returns the class to display the activation-state of the given task
    getActivationClass: function(task) {
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
        
        return type;
    },
    
    //Returns the current streak as a string "Streak+5"
    getStreak: function(task, date) {
        var streak = 0;
        var todayBonus = 0;
        
        //let's search for the current date
        $.each(task.activations, function(i, act) {
            if(act.date == date) {
                todayBonus = 1;
            }
        });
        
        //now we get backwards in time until we cannot find an activation
        while(true) {
            date = $.subtractDays(date, 1);
            var dateFound = false;
            $.each(task.activations, function(index, act) {
                if(act.date == date) {
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

//This updates the tasks in the given container according to their data('task')
$.fn.updateTasks = function() {
    var container = $(this);
    var htmlTasks = container.find('.task');
    
    //update the streaks, activations
    $.each(htmlTasks, function(i, htmlTask) {
        var id = "#" + htmlTask.id;
        var task = $(id).data("task");
        
        //Streak
        $(id).find('.streak').text( $.getStreak(task, $.getCurrentDate()) );
        
        //Activation
        $(id).removeClass();
        $(id).addClass('task');
        $(id).addClass( $.getActivationClass(task) );

        var catId = "#" + task.category + "List";
        $(catId).listview('refresh');        
    });
};

//This appends the given task to the container
$.fn.appendTask = function(task) {
    //calculate the streak
    var streak = $.getStreak(task, $.getCurrentDate());

    //get activation class
    var type = $.getActivationClass(task);

    var newTask = "";
    newTask +=  "<li class='task " + type + "' id='task-" + task.index + "'>";
    newTask +=      "<div class='ui-grid-a'>";
    newTask +=          "<div class='ui-block-a'><h3 class='taskTitle'>" + task.title + "</h3></div>";
    newTask +=          "<div class='ui-block-b text-right streak'>" + streak + "</div>";
    newTask +=      "</div>";
    newTask +=      "<p class='taskText'>" + task.text + "</p>";
    newTask +=  "</li>";
    $('#' + task.category + 'List').append(newTask);

    //append the task as data to the current HTML-element
    $('#task-' + task.index).data("task", task);
};

$.fn.showTasks = function(tasks) {
    //let's store the container into a variable, so that we can use it later
    //it seems as if javascript is overwriting the this-pointer somewhere in $.each
    var categories = $(this);
    var date = $.getCurrentDate();
    
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
    
    //add the category-divs
    $.each(givenCategories, function(i, cat) {
        var catId = cat + "Container";
        
        var newCat = "";
        newCat += "<div class='category' id='" + catId + "'>";
        newCat +=   "<h3 class='catName' >" + cat + "</h3>";
        newCat +=   "<ul data-role='listview' class='catList' id='" + cat + "List'></ul>";
        newCat += "</div>";
        categories.append(newCat);
    });
    
    //add the tasks to the categories
    $.each(tasks, function(i, task) {
        var catId = "#" + task.category + "Container";
        $(catId).appendTask(task);
    });
    
    //refresh the page (this causes jQuery Mobile to update the UI elements)
    $('#categories').trigger('create');
    $.updateScore();
};
