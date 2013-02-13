


$(document).ready( function () {
    
    ////////////////////////////////////////////////////////
    //      Initialization of the page
    ////////////////////////////////////////////////////////
    
    //this is the interface we're using
    var aimHigh="http://aimhigh2.nilsbrinkmann.com/interface/interface.php";
    
    //TODO: This is not elegant, we should change the design to support async queries
    $.ajaxSetup({async:false});
    
    //get the userkey, create a new user if there is no given user
    var userkey = $.getUserKey();
    if(userkey == '')
    {
        //The following code redirects to the new users page...
        //Perhaps there is a better way to load the URL for a new user,
        //but I couldn't find it...
        var randomMd5 = md5( Math.random().toString() );
        window.location.replace("http://aimhigh2.nilsbrinkmann.com/" + randomMd5);
        return;
    }
    
    //call the user, it will be created if not already existing
    var postVars = {userkey: userkey, request: 'touchUser'};
    $.post(aimHigh, postVars, function(data) {
        console.log("Touched the user, received the following response: " + data);
    });
    
    //setup the Datepicker
    var currentDate = new Date();
    var dateStr = currentDate.getFullYear() + "-" + $.pad2(currentDate.getMonth()+1) + "-" + $.pad2(currentDate.getDate());
    console.log("Build the following date: " + dateStr);
    $("#selectedDate").val( dateStr );
    
    //update the categories/tasks
    $.refreshTasks(aimHigh, userkey);
    
    
});

///////////////////////////////////////
//   Specific Extensions
///////////////////////////////////////
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
    },
    
    //queries and returns the tasks of the given user
    refreshTasks: function(url, userkey) {
        var postVars = {userkey: userkey, request: 'getTasks'};
        $.post(url, postVars, function(data) {
            var tasks = $.parseJSON(data);
            
            console.log("getTasks() received the following tasks:");
            console.log(tasks);
            
            //refresh everything
            $('#categories').showTasks(tasks, $.getCurrentDate());
        });
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
        newCat +=   "<h3>" + cat + "</h3>";
        newCat +=   "<ul data-role='listview' class='catList' id='" + cat + "List'></ul>";
        newCat += "</div>";
        categories.append(newCat);
    });
    
    //add the tasks to the categories
    $.each(tasks, function(i, task) {
        
        //TODO: get streak
        
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
        newTask +=  "<li class='" + type + "'>";
        newTask +=      "<div class='ui-grid-a'>";
        newTask +=          "<div class='ui-block-a'><h3>" + task.title + "</h3></div>";
        newTask +=          "<div class='ui-block-b text-right'>Streak+1</div>";
        newTask +=      "</div>";
        newTask +=      "<p>" + task.text + "</p>";
        newTask +=  "</li>";
        $('#' + task.category + 'List').append(newTask);
    });
    
    //refresh the page (this causes jQuery Mobile to update the UI elements)
    $('#mainPage').trigger('create');
}

