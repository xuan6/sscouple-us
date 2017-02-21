//tooltip for scatter plot
var tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);


//tooltip for bard
var tooltipbars = d3.select("body").append("div")
.attr("class", "tooltipbars")
.style("opacity", 0);

var svg1 = d3.select("#bars");
var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = 500 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
var g = svg1.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x0 = d3.scaleBand()//For each bar group, constructs a new band scale with the empty domain, map to each row (i.e. each type of couple)
.rangeRound([0, width])
    .paddingInner(0.1);//set padding between bar groups

var x1 = d3.scaleBand()//For each individual bar in a group, constructs a new band scale with the empty domain, map to each columns of one row (i.e. different income ranks of one type of couples)
    .padding(0.05);//set padding between individual bars

    var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var z = d3.scaleOrdinal()//colors for different columns i.e. for different ranks
.range(["#C6E9BF","#A2D89A", "#73C475", "#30A355", "#006F2F"]);

d3.csv("income14.csv", function(d, i, columns) {
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];//for each row
  return d;//get the value of each column
}, function(error, data) {
	if (error) throw error;

  var keys = data.columns.slice(1);//get the name of each column as a key

  x0.domain(data.map(function(d) { return d.type; }));//set the domain of those types of couples
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);//set the sub-domain (i.e. the income ranks) of each group of couples
  y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

  //draw grouped bars
  g.append("g")
  .selectAll("g")
  .data(data)
    .enter().append("g")//draw a group
    .attr("transform", function(d) { return "translate(" + x0(d.type) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")//draw individual bars
    .attr("x", function(d) { return x1(d.key); })
    .attr("y", function(d) { return y(d.value); })
    .attr("width", x1.bandwidth())
    .attr("height", function(d) { return height - y(d.value); })
    .attr("fill", function(d) { return z(d.key); })
    .on("mouseover",function(d){
    	tooltipbars.transition()
    	.duration(200)
    	.style("opacity",.9);
    	tooltipbars.html(d.value+"%")
    	.style("left",(d3.event.pageX+4)+"px")
    	.style("top",(d3.event.pageY -2)+"px");
    })
    .on("mouseout",function(d){
    	tooltipbars.transition()
    	.duration(500)
    	.style("opacity",0);
    });

    g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x0));

    g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text("Percentage");

    var legend = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
    .attr("x", width - 19)
    .attr("width", 19)
    .attr("height", 19)
    .attr("fill", z);

    legend.append("text")
    .attr("x", width - 24)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) { return d; });
});

var svg2 = d3.select("#scatter"),
g2 = svg2.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var col = d3.scaleOrdinal()//colors for different columns i.e. for different ranks
.range(["#ffd56b","#63c8ff", "#ffaff5"]);

var xS = d3.scaleLinear()
.domain([20, 80])
.range([0, width]);

var yS = d3.scaleLinear()
.domain([80000, 140000])
.range([height, 0]);

var xAxisS = d3.axisBottom()
.ticks(10)
.scale(xS);

svg2.append("g")
.attr("class", "axis")
.attr("transform", "translate(0," + height + ")")
.call(xAxisS)
.append("text")
.attr("x", width)
.attr("y", -6)
.style("text-anchor", "end")
.text("Education-need-change");

var yAxisS = d3.axisLeft()
.scale(yS);

svg2.append("g")
.attr("class", "axis")
.call(yAxisS)
.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 6)
.attr("dy", ".71em")
.style("text-anchor", "end")
.style("color", "black")
.text("Average Household ($)");

function drawVis(dataset, xVariable, yVariable) { //draw the circiles initially and on each interaction with a control
	var xVariableLabel;
	switch(xVariable) {
    case 'HE':
        xVariableLabel = 'Household Employed';
    case 'BE':
        xVariableLabel = 'Both Partner Employed';
        case 'HB':
        xVariableLabel = 'Household with Bachelor or Higer Degree';
        case 'BE':
        xVariableLabel = 'Both Partners with Bachelor or Higer Degrees';
    default:
        xVariableLabel = 'Household Employed';
}

	var circle = svg2.selectAll("circle")
	.data(dataset);

	circle
	.attr("cx", function(d, i) { return xS(d[xVariable]);  })
	.attr("cy", function(d, i) { return yS(d[yVariable]);  })
	.style("fill", function(d) { return col(d.type); });

	circle.exit().remove();

	circle.enter().append("circle")
	.attr("cx", function(d, i) { return xS(d[xVariable]);  })
	.attr("cy", function(d, i) { return yS(d[yVariable]);  })
	.attr("r", 10)
	.style("stroke", "black")
     //.style("fill", function(d) { return colLightness(d.vol); })
     .style("fill", function(d) { return col(d.type); })
     .style("opacity", 0.5)
     .on("mouseover",function(d){
     	tooltip.transition()
     	.duration(200)
     	.style("opacity",.9);
     	// tooltip.html(d[xVariable])
     	tooltip.html("<p>Percentage: "+d[xVariable]+"%</p><p>Household Income: $"+d[yVariable]+"</p>")
     	.style("left",(d3.event.pageX+4)+"px")
     	.style("top",(d3.event.pageY +30)+"px");
     })
     .on("mouseout",function(d){
     	tooltip.transition()
     	.duration(500)
     	.style("opacity",0);
     });

 }

 var xVariable;
 var yVariable;
 var dataset;


 d3.csv("ee14.csv", function(error, percentage) {
//read in the data
if (error) return console.warn(error);
percentage.forEach(function(d) {
     	// console.log(d[columns[t]]);
     	d.HE = +d.HE;
     	d.BE = +d.BE;
     	d.HB = +d.HB;
     	d.BB = +d.BB;
     	d.AHI = +d.AHI;
     });
//default view shows householder employment and average household income
xVariable = 'HE';
yVariable = 'AHI';
dataset = percentage;

//all the data is now loaded, so draw the initial vis
drawVis(dataset, xVariable, yVariable);

});


 function filterType(mtype) {
 	xVariable == mtype;
 	drawVis(dataset, xVariable, yVariable); 
 }


