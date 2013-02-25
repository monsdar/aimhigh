
//This file has dependencies to
//  util.js
//  Highcharts

$.extend({
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

        //sum up the activations
        $.each(tasks, function(i, task) {
            $.each(task.activations, function(i, act) {
                if(act.date in dailyActivations)
                {
                    if(task.isNegative == "1") {
                        dailyActivations[act.date] = dailyActivations[act.date] - 1;
                    } else {
                        dailyActivations[act.date] = dailyActivations[act.date] + 1;
                    }
                }
            });
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
