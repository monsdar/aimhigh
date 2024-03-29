

//////////////////////////////////////////////
//      Initialization of the page
//////////////////////////////////////////////

//This loads user-specific content (tasks, ...) into the page
$(document).delegate("#mainPage", "pageinit", function() {
    //Init the validation-engine
    $("#newTaskForm").validationEngine('attach', {promptPosition : "topLeft"});
    $("#editTaskForm").validationEngine('attach', {promptPosition : "topLeft"});
    
    //check if the userkey is empty (shouldn't be the possible, but you never know...)
    if(getUserkey() === '') {
        console.log("No user given, Aimhigh will not initialize");
        return;
    }
    
    //call the user, it will be created if not already existing
    var touchCallback = function(isNewUser) {
        //setup the Datepicker
        var dateStr = $.getDateString(new Date());
        console.log("Build the following date: " + dateStr);
        $("#selectedDate").val( dateStr );

        //update the categories/tasks
        $.refreshCategories();  
    };
    $.touchUser(touchCallback);
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
    if(event.which === 3) {
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
    var taskLink = task.find('a');
    var classList = taskLink.attr('class').split(/\s+/);
    $.each( classList, function(index, item){
        if ( item === 'positiveTask') {
            taskLink.removeClass('positiveTask').addClass('positiveTaskDone');
            $.addActivation(task.data("task"), $.getCurrentDate());
        }
        else if ( item === 'positiveTaskDone') {
            taskLink.removeClass('positiveTaskDone').addClass('positiveTask');
            $.removeActivation(task.data("task"), $.getCurrentDate());
        }
        else if ( item === 'negativeTask') {
            taskLink.removeClass('negativeTask').addClass('negativeTaskDone');
            $.addActivation(task.data("task"), $.getCurrentDate());
        }
        else if ( item === 'negativeTaskDone') {
            taskLink.removeClass('negativeTaskDone').addClass('negativeTask');
            $.removeActivation(task.data("task"), $.getCurrentDate());
        }
    });

    //de/activate the task in the DB
    
    var taskId = task.attr('id').split('-')[1];
    var selectedDate = $.getCurrentDate();
    
    var callback = function() {
        //update the classes and score
        $('#categories').updateTasks();
        $.updateScore();
    };
    $.toggleTask(taskId, selectedDate, callback);
    
});

//This checks if the Date has changed and shows the appropriate tasks/activations
$(document).on('change', '#selectedDate', function() {
    var dateEdit = $(this);
    if(dateEdit.val() === '') {
        dateEdit.val( $.getDateString(new Date()) );
    }
    console.log("Date changed to " + $('#selectedDate').val() );
    
    $('#categories').updateTasks();
});

//Updates the score before the dialog pops up
$(document).on('popupbeforeposition', '#popupStats', function() {
    $("#graph").showGraph( $("#categories") );
    $('#activationRanking').updateTopTasks( $("#categories") );
});

//This clears the CreateTaskDialog before it shows up
$(document).on('pagebeforeshow', '#createTask', function() {
    console.log("Opened CreateTask dialog");
    var page = $(this);
    
    $('#cbCreateMon').attr('checked', false).checkboxradio( "refresh" );
    $('#cbCreateTue').attr('checked', false).checkboxradio( "refresh" );
    $('#cbCreateWed').attr('checked', false).checkboxradio( "refresh" );
    $('#cbCreateThu').attr('checked', false).checkboxradio( "refresh" );
    $('#cbCreateFri').attr('checked', false).checkboxradio( "refresh" );
    $('#cbCreateSat').attr('checked', false).checkboxradio( "refresh" );
    $('#cbCreateSun').attr('checked', false).checkboxradio( "refresh" );
    
    page.find('#createTitle').val('');
    page.find('#createText').val('');
    page.find('#createCategory').val('');
    page.find('#createIsNegative').val('positive');
});

//Creates a new Task from CreateTaskDialog
$(document).on('click', '#newTaskSubmit', function() {
    if( $("#newTaskForm").validationEngine('validate') === false ) {
        return;
    }
    
    var page = $(this).closest('#createTask');
    var title = page.find('#createTitle').val();
    var text = page.find('#createText').val();
    var category = page.find('#createCategory').val();
    var isNegative = page.find('#createIsNegative').val();
    
    if(isNegative === 'positive') {
        isNegative = 0;
    }
    else {
        isNegative = 1;
    }
    
    var offdays = new Array();
    if($('#cbCreateMon').is(':checked')) {
        offdays.push("MONDAY");
    }
    if($('#cbCreateTue').is(':checked')) {
        offdays.push("TUESDAY");
    }
    if($('#cbCreateWed').is(':checked')) {
        offdays.push("WEDNESDAY");
    }
    if($('#cbCreateThu').is(':checked')) {
        offdays.push("THURSDAY");
    }
    if($('#cbCreateFri').is(':checked')) {
        offdays.push("FRIDAY");
    }
    if($('#cbCreateSat').is(':checked')) {
        offdays.push("SATURDAY");
    }
    if($('#cbCreateSun').is(':checked')) {
        offdays.push("SUNDAY");
    }
    var offdayStr = offdays.join(',');
    
    //create the task, refresh the tasks after that
    var callback = function() {
        $.refreshCategories();
    };
    $.createTask(title, text, category, isNegative, offdayStr, callback);
    
    page.dialog('close');
});

//Initializes the EditTaskDialog with value from the selected task
$(document).on('pagebeforeshow', '#editTask', function() {
    console.log("Opened EditTask dialog");
    var task = window.selectedTask;
    var dialog = $(this);
    
    var isNegative = "true";
    if(task.isNegative === "0") {
        isNegative = "false";
    }
    
    if(task.offdays.indexOf("MONDAY") >= 0) {
        $('#cbEditMon').attr('checked', true).checkboxradio( "refresh" );
    }
    else {
        $('#cbEditMon').attr('checked', false).checkboxradio( "refresh" );
    }
    if(task.offdays.indexOf("TUESDAY") >= 0) {
        $('#cbEditTue').attr('checked', true).checkboxradio( "refresh" );
    }
    else {
        $('#cbEditTue').attr('checked', false).checkboxradio( "refresh" );
    }
    if(task.offdays.indexOf("WEDNESDAY") >= 0) {
        $('#cbEditWed').attr('checked', true).checkboxradio( "refresh" );
    }
    else {
        $('#cbEditWed').attr('checked', false).checkboxradio( "refresh" );
    }
    if(task.offdays.indexOf("THURSDAY") >= 0) {
        $('#cbEditThu').attr('checked', true).checkboxradio( "refresh" );
    }
    else {
        $('#cbEditThu').attr('checked', false).checkboxradio( "refresh" );
    }
    if(task.offdays.indexOf("FRIDAY") >= 0) {
        $('#cbEditFri').attr('checked', true).checkboxradio( "refresh" );
    }
    else {
        $('#cbEditFri').attr('checked', false).checkboxradio( "refresh" );
    }
    if(task.offdays.indexOf("SATURDAY") >= 0) {
        $('#cbEditSat').attr('checked', true).checkboxradio( "refresh" );
    }
    else {
        $('#cbEditSat').attr('checked', false).checkboxradio( "refresh" );
    }
    if(task.offdays.indexOf("SUNDAY") >= 0) {
        $('#cbEditSun').attr('checked', true).checkboxradio( "refresh" );
    }
    else {
        $('#cbEditSun').attr('checked', false).checkboxradio( "refresh" );
    }
    
    dialog.find('#editTitle').val( task.title );
    dialog.find('#editText').val( task.text );
    dialog.find('#editCategory').val( task.category );
    dialog.find('#editIsNegative').val( isNegative ).slider("refresh");
});

//Submits an edited task
$(document).on('click', '#editTaskSubmit', function() {
    if( $("#editTaskForm").validationEngine('validate') === false ) {
        return;
    }
    
    var page = $(this).closest('#editTask');
    var taskId = window.selectedTask.index;
    var title = page.find('#editTitle').val();
    var text = page.find('#editText').val();
    var category = page.find('#editCategory').val();
    var isNegative = page.find('#editIsNegative').val();
    
    if(isNegative === 'true') {
        isNegative = 1;
    }
    else {
        isNegative = 0;
    }
    
    var offdays = new Array();
    if($('#cbEditMon').is(':checked')) {
        offdays.push("MONDAY");
    }
    if($('#cbEditTue').is(':checked')) {
        offdays.push("TUESDAY");
    }
    if($('#cbEditWed').is(':checked')) {
        offdays.push("WEDNESDAY");
    }
    if($('#cbEditThu').is(':checked')) {
        offdays.push("THURSDAY");
    }
    if($('#cbEditFri').is(':checked')) {
        offdays.push("FRIDAY");
    }
    if($('#cbEditSat').is(':checked')) {
        offdays.push("SATURDAY");
    }
    if($('#cbEditSun').is(':checked')) {
        offdays.push("SUNDAY");
    }
    var offdayStr = offdays.join(',');
    
    //edit the task, refresh the tasks after that
    var callback = function() {
        $.refreshCategories();
    };
    $.editTask(taskId, title, text, category, isNegative, offdayStr, callback);
    
    page.dialog('close');
});

$(document).on('click', '#deleteTaskSubmit', function() {
    var taskId = window.selectedTask.index;
    
    //delete the task, refresh the tasks after that
    var callback = function() {
        $.refreshCategories();
    };
    $.deleteTask(taskId, callback);
});

///////////////////////////////////////
//  Extensions
///////////////////////////////////////
$.extend({    
    //returns the taskId of a given task
    getTaskId: function(task) {
        return task.attr('id').split('-')[1];
    },
            
    getCategories: function() {
        var categories = new Array();
        
        var htmlTasks = $('#categories').find('.task');
        $.each(htmlTasks, function(index, htmlTask) {
            var id = "#" + htmlTask.id;
            var task = $(id).data("task");
            if( categories.indexOf(task.category) === -1  ) {
                categories.push(task.category);
            }
        });
        
        return categories;
    },
    
    //queries the interface for tasks and fills them into the categories-div
    refreshCategories: function() {
        var callback = function (tasks) {
            $('#categories').showTasks(tasks);
        };
        $.queryTasks(callback);  
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
    
    //Returns the currently selected date (string in form yy-mm-dd)
    getCurrentDate: function(){
        var date = $('#selectedDate').val();
        return date;
    },
    
    //Returns the class to display the activation-state of the given task
    getActivationClass: function(task) {
        var isActivated = $.isActivated(task, $.getCurrentDate());
        var type = 'positiveTask';
        if(task.isNegative === '1' && !isActivated) {
            type = 'negativeTask';
        }
        else if(task.isNegative === '1' && isActivated) {
            type = 'negativeTaskDone';
        }
        else if(task.isNegative === '0' && isActivated) {
            type = 'positiveTaskDone';
        }
        
        return type;
    },
    
    //converts a streak from int to a string like "Streak+5"
    streakToString: function(streak) {
        if(streak === 0) {
            return "";
        }
        
        return "Streak+" + streak;
    },
        
    updateScore: function() {
        var score = $('#score');
        var date = $.getCurrentDate();
        var scoreNegative = 0;
        var scorePositive = 0;
        var htmlTasks = $('#categories').find('.task');
        $.each(htmlTasks, function(index, htmlTask) {
            var id = "#" + htmlTask.id;
            var task = $(id).data("task");
            if(task.isNegative === '0') {
                scorePositive = scorePositive + $.getRelativeScore(task, date);
            }
            else {
                scoreNegative = scoreNegative + $.getRelativeScore(task, date);
            }
        });
        
        var newScore = scorePositive - scoreNegative;
        newScore = (Math.round(newScore * 100) / 100); //Round the score to 2 digits
        score.text( newScore );
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
        var streakStr = "";
        if(task.isNegative === "0") {
            streakStr = $.streakToString( $.getStreak(task, $.getCurrentDate()));
        }
        else {
            streakStr = $.streakToString( $.getNegativeStreak(task, $.getCurrentDate()));
        }
        $(id).find('.streak').text( streakStr );
        
        //Offdays
        $(id).toggleClass('ui-disabled', !($.isEnabled(task, $.getCurrentDate())) );
        
        //Activation
        var taskLink = $(id).find('a');
        taskLink.removeClass();
        taskLink.addClass( 'ui-link-inherit' );
        taskLink.addClass( $.getActivationClass(task) );

        var catId = "#" + md5(task.category) + "List";
        $(catId).listview('refresh');        
    });
    
    $.updateScore();
};

//This appends the given task to the container
$.fn.appendTask = function(task) {
    //calculate the streak
    var streak = "";
    var icon = "";
    if(task.isNegative === '0') {
        streak = $.streakToString( $.getStreak(task, $.getCurrentDate()));
        icon = "plus";
    }
    else {
        streak = $.streakToString( $.getNegativeStreak(task, $.getCurrentDate()));
        icon = "minus";
    }

    //get activation class
    var type = $.getActivationClass(task);
    
    //get if the task is disabled for today
    var disableUi = "";
    if(! $.isEnabled(task, $.getCurrentDate())) {
        disableUi = 'ui-disabled';
    }

    var newTask = "";
    newTask +=  "<li data-icon='" + icon + "' class='task " + disableUi + "' id='task-" + task.index + "'>";
    newTask +=      "<a href='#' class='" + type + "'>";
    newTask +=          "<div class='ui-grid-a'>";
    newTask +=              "<div class='ui-block-a'><h3 class='taskTitle'>" + task.title + "</h3></div>";
    newTask +=              "<div class='ui-block-b align-right streak'>" + streak + "</div>";
    newTask +=          "</div>";
    newTask +=          "<p class='taskText'>" + task.text + "</p>";
    newTask +=      "</a>";
    newTask +=  "</li>";
    $('#' + md5(task.category) + 'List').append(newTask);

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
        if( $.inArray(currentCat, givenCategories) === -1 )
        {
            givenCategories.push(currentCat);
        }
    }); 
    
    //add the category-divs
    $.each(givenCategories, function(i, cat) {
        var catId = md5(cat) + "Container";
        
        var newCat = "";
        newCat += "<div class='dynamicContainer category' id='" + catId + "'>";
        newCat +=   "<h3 class='catName' >" + cat + "</h3>";
        newCat +=   "<ul data-role='listview' data-inset='true' class='catList' id='" + md5(cat) + "List'></ul>";
        newCat += "</div>";
        categories.append(newCat);
    });
    
    //sort the tasks (positive up, negative down)
    tasks.sort( function(a,b) {
        if(a.isNegative === "0" && b.isNegative !== "0") {
            return -1;
        }
        else if (a.isNegative !== "0" && b.isNegative === "0"){
            return +1;
        }
        
        //both tasks are equal (positive or negative)
        return 0;
    });
    
    //add the tasks to the categories
    $.each(tasks, function(i, task) {
        var catId = "#" + md5(task.category) + "Container";
        $(catId).appendTask(task);
    });
    
    //refresh the page (this causes jQuery Mobile to update the UI elements)
    $('#categories').trigger('create');
    $.updateScore();
};
