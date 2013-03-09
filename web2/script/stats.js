
//This file has dependencies to
//  util.js
//  Highcharts

$.extend({
    
    //Adds a activation to the given task and date
    addActivation: function(task, date) {
        //the activation.index is not important here
        var activation = {date: date, index: "0"};
        task.activations.push( activation );
    },
    
    //Removes an activation for the given task and date
    removeActivation: function(task, date) {
        var id = -1;
        $.each(task.activations, function(index, act) {
            if(act.date === date) {
                id = index;
            }
        });
        
        if(id !== -1) {
            task.activations.splice(id, 1);   
        }
    },
    
    //Returns true if the given task is activated at the given date, else false
    isActivated: function(task, date) {
        var result = false;
        $.each(task.activations, function(index, act) {
            if(act.date === date) {
                result = true;
                return false; //break
            }
        });
        return result;
    },
      
    //checks if the given task is disabled for today
    isEnabled: function(task, date) {
        var weekdays = new Array(7);
        weekdays[0]="SUNDAY";
        weekdays[1]="MONDAY";
        weekdays[2]="TUESDAY";
        weekdays[3]="WEDNESDAY";
        weekdays[4]="THURSDAY";
        weekdays[5]="FRIDAY";
        weekdays[6]="SATURDAY";

        var realDate = new Date( Date.parse(date) );
        var weekday = weekdays[realDate.getDay()];
        
        if(task.offdays.indexOf(weekday) >= 0) {
            return false;
        }
        return true;
    },
    
    //Returns how long the task has been activated
    getStreak: function(task, date) {
        var streak = 0;
        var todayBonus = 0;
        
        //let's search for the current date
        if($.isActivated(task, date)) {
            todayBonus = 1;
        }
        
        //now we get backwards in time until we cannot find an activation
        while(true) {
            date = $.subtractDays(date, 1);
            if($.isActivated(task, date)) {
                streak = streak + 1;
            }
            else {
                break;
            }
        }
        
        return (streak + todayBonus);
    },
    
    //Returns how long the task has NOT been activated
    //as a string "Streak+5"
    getNegativeStreak: function(task, date) {
        var streak = 0;
        
        //let's go back in time to search when the task has been lastly activated
        //if there are no activations just check if today is activated
        var containsActivations = true;
        if(task.activations.length === 0) {
            containsActivations = false;
        }
        while(containsActivations) {
            if($.isActivated(task, date)) {
                break;
            }

            date = $.subtractDays(date, 1);
            streak = streak + 1;
        }
        
        return streak;
    },
    getDaysSinceLastAct: function(task, date, maxDays) {
        //if the task haven't been activated yet simply return 1
        if(task.activations.length <= 1) {
            return 1;
        }
        
        var days = 1;
        date = $.subtractDays(date, 1);
        while(maxDays >= 0) {
            if($.isActivated(task, date)) {
                return days;
            }
            days = days + 1;
            date = $.subtractDays(date, 1);
            maxDays = maxDays - 1;
        }
        
        return maxDays;
    },
    
    getRelativeScore: function(task, date) {
        if($.isActivated(task, date) === false) {
            return 0;
        }
        
        var dynamicScore = 1;
        if(task.isNegative === '0') {
            dynamicScore = $.getDaysSinceLastAct(task, date, 10);
        }
        else {
            dynamicScore = $.getStreak(task, date);
        }
        var baseScore = 1;
        var result = baseScore + ( (dynamicScore-1) / 10);
        return (Math.round(result * 100) / 100);
    },
    
    
    //Returns the summed up activations for the last x days
    getActivations: function(tasks, lastXDays) {
        //this object will be returned
        var dailyActivations = new Object();

        //prefill the activations with the requested dates
        var date = new Date();
        date.setDate( date.getDate() - lastXDays ); //start from the first day
        for (var index=0; index<lastXDays; index++)
        { 
            date.setDate(date.getDate() + 1); //add a day
            var dateStr = $.getDateString(date);
            dailyActivations[ dateStr ] = 0;
        }

        //get the score for each day
        $.each(dailyActivations, function(key, value) {
            var dayScore = 0;
            $.each(tasks, function(i, task) {
                if(task.isNegative === '0') {
                    dayScore = dayScore + $.getRelativeScore(task, key);
                }
                else {
                    dayScore = dayScore - $.getRelativeScore(task, key);
                }
            });
            dailyActivations[key] = dayScore;
        });
        
        return dailyActivations;
    } 
});

$.fn.updateTopTasks = function(taskContainer) {
    var table = $(this);
    
    //get the tasks from the container
    var tasks = new Array();
    var htmlTasks = $(taskContainer).find('.task');
    $.each(htmlTasks, function(i, htmlTask) {
        var taskId = "#" + htmlTask.id;
        var task = $(taskId).data("task");
        tasks.push(task);
    });
    
    //Sort the tasks
    tasks.sort( function(a,b) { 
        var aLen = a.activations.length;
        var bLen = b.activations.length;
        var result = (aLen - bLen) * -1;
        return result;
    });
    
    //clear the table-contents
    table.find("tbody").empty();
    
    //Fill the table
    $.each(tasks, function(index, task) {
        //just display the top 10 items
        if(index > 9) {
            return false; //break
        }
        var tableRow = "";
        tableRow += "<tr>";
        tableRow +=     "<th>" + (index + 1) + "</th>";
        tableRow +=     "<td>" + task.title + "</td>";
        tableRow +=     "<td>" + task.activations.length + "</td>";
        tableRow += "</tr>";
        table.find("tbody").append(tableRow);
    });
};

$.fn.showGraph = function(taskContainer) {
    var options = {};
    options.chart = { renderTo: $(this).attr('id'), type: 'line' };
    options.title = { text: 'Score History' };
    options.series = [];
        
    //get the tasks from the container
    var tasks = new Array();
    var htmlTasks = $(taskContainer).find('.task');
    $.each(htmlTasks, function(i, htmlTask) {
        var taskId = "#" + htmlTask.id;
        var task = $(taskId).data("task");
        tasks.push(task);
    });
    
    //push the activations into the graph
    //TODO: get the tasks from data() instead of window...
    var activations = $.getActivations(tasks, 7);
    var data = [];
    $.each(activations, function(i, act) {
        data.push(act);
    });
    options.series.push( { name: 'Daily Score', data: data } );
    
    //get the maximum score
    var maxScore = $.getMaximum(activations);
    var minScore = $.getMinimum(activations);
    
    options.yAxis = { title: { text: 'Score'}, allowDecimals: false, min: minScore, minTickInterval: 1, max: maxScore};
    options.xAxis = { title: { text: 'Time'}, allowDecimals: false, labels: { enabled: false }};
    
    return new Highcharts.Chart(options);
};
