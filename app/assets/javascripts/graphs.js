/* global d3 */

$(function(){
// set up SVG for D3
var width  = 800,
    height = 760,
    radius = 30,
    currentLocation = {x:0, y:0},
    selected_node_refNo = -1,
    colors = d3.scale.category10();

var svg = d3.select('#graphDiv')
  .append('svg')
  .attr('oncontextmenu', 'return false;')
  .style('width', width)
  .style('height', height);

  var nodes = [], links = [];

function processData(data){
    data.links.forEach(function (link) {
       link.source = data.nodes.find(function (node) {
           return node.id == link.source_id;
       });
       link.target = data.nodes.find(function (node) {
           return node.id == link.target_id;
       });
    });
    return {links: data.links, nodes: data.nodes};
}


// init D3 force layout
var force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(170)
    .charge(-500)
    .on('tick', tick);

$.ajax({
   url: '/graph',
   contentType: 'json',
   error: function() {
      alert('An error has occurred');
   },
   dataType: 'json',
   success: function(data) {
      var i = 0;
      data.nodes.forEach(function(node){node.x = i*80; node.y = i*80; i = i+1;})
      var processedData = processData(data);
      nodes = processedData.nodes;
      console.log(nodes);
      links = processedData.links;
      console.log(links);
      force = d3.layout.force()
    .nodes(nodes)
    .links(links)
    .size([width, height])
    .linkDistance(170)
    .charge(-500)
    .on('tick', tick);
      restart();
   },
   type: 'GET'
});



// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 12)
    .attr('markerWidth', 1)
    .attr('markerHeight', 1)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 12)
    .attr('markerWidth', 7)
    .attr('markerHeight', 7)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

// line displayed when dragging new nodes
var drag_line = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

// handles to link and node element groups
var path = svg.append('svg:g').selectAll('path'),
    circle = svg.append('svg:g').selectAll('g');

// mouse event vars
var selected_node = null,
    selected_link = null,
    mousedown_link = null,
    mousedown_node = null,
    mouseup_node = null;

function resetMouseVars() {
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

// update force layout (called automatically each iteration)
function tick() {
  // draw directed edges with proper padding from node centers
  path.attr('d', function(d) {
    var deltaX = d.target.x - d.source.x,
        deltaY = d.target.y - d.source.y,
        dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        normX = deltaX / dist,
        normY = deltaY / dist,
        sourcePadding = d.left ? 17 : 12,
        targetPadding = d.right ? 17 : 12,
        sourceX = d.source.x + (sourcePadding * normX),
        sourceY = d.source.y + (sourcePadding * normY),
        targetX = d.target.x - (targetPadding * normX),
        targetY = d.target.y - (targetPadding * normY);
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
  });

  circle.attr('transform', function(d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });
}

// update graph (called when needed)
function restart() {
  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


  // add new links
  path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', function(d) { return d === selected_link; })
    .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
    .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select link
      mousedown_link = d;
      if(mousedown_link === selected_link) selected_link = null;
      else selected_link = mousedown_link;
      selected_node = null;
      restart();
      
    });

  // remove old links
  path.exit().remove();

  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, function(d) { return d.id; });

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.nType)).brighter().toString() : colors(d.nType); })
    .classed('reflexive', function(d) { return d.reflexive; });

  // add new nodes
  var g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', radius)
    .style('fill', function(d) { return (d === selected_node) ? d3.rgb(colors(d.nType)).brighter().toString() : colors(d.nType); })
    .style('stroke', function(d) { return d3.rgb(colors(d.nType)).darker().toString(); })
    .classed('reflexive', function(d) { return d.reflexive; })
    .on('mouseover', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function(d) {
      if(!mousedown_node || d === mousedown_node) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('mousedown', function(d) {
      if(d3.event.ctrlKey) return;

      // select node
      mousedown_node = d;
      if(mousedown_node === selected_node) selected_node = null;
      else selected_node = mousedown_node;
      selected_link = null;

      // reposition drag line
      drag_line
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

      restart();
    })
    .on('mouseup', function(d) {
      if(!mousedown_node) return;

      // needed by FF
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');

      // check for drag-to-self
      mouseup_node = d;
      if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      var source, target, direction;
      if(mousedown_node.id < mouseup_node.id) {
        source = mousedown_node;
        target = mouseup_node;
        direction = 'right';
      } else {
        source = mouseup_node;
        target = mousedown_node;
        direction = 'left';
      }

      var link;
      link = links.filter(function(l) {
        return (l.source === source && l.target === target);
      })[0];

      if(link) {
        link[direction] = true;
      } else {
        link = {source: source, target: target, left: false, right: false};
        link[direction] = true;
        links.push(link);

        updateLinks(source, target, true);
      }

      // select new link
      selected_link = link;
      selected_node = null;
      restart();
    })
    .on('dblclick', function(d){
        selected_node = d;
        selected_node_refNo = -1;
        var i = 0;
        var len = 0;
        for(i = 0, len = nodes.length; i < len; i++) {
            if (nodes[i].id === d.id) {
                selected_node_refNo = i;
                break;
            }
        }

        $("#editNodeNameTxt").val(selected_node.fullName);
        $("#editShortNodeNameTxt").val(selected_node.lbl);
        $("#editNodeDialog").modal();
    });

  // show node labels
  g.append('svg:text')
      .attr('x', 0)
      .attr('y', 4)
      .attr('class', 'id')
      .attr('id', function(d) { return "text" + d.id; })
      .text(function(d) { return d.lbl; });

  // remove old nodes
  circle.exit().remove();

  // set the graph in motion
  force.start();
}

function mousedown() {
  // prevent I-bar on drag
  //d3.event.preventDefault();

  // because :active only works in WebKit?
  svg.classed('active', true);

  if(d3.event.ctrlKey || mousedown_node || mousedown_link) return;

  // insert new node at point
 /* var point = d3.mouse(this);

  currentLocation.x = point[0];
  currentLocation.y = point[1];

  $("#insertNodeDialog").modal();*/

}
/*
function addNode(){
  var node = {id: ++lastNodeId, reflexive: false};

  node.x = currentLocation.x;
  node.y = currentLocation.y;

  node.lbl = $("#shortNodeNameTxt").val();
  node.nType = $("#nodeTypeSelect").val();
  node.fullName = $("#nodeNameTxt").val();

  nodes.push(node);

  restart();
}
*/

function editNode(){
  debugger;
  selected_node.lbl = $("#editShortNodeNameTxt").val();
  var url = "";
  var data = {};
  if(selected_node.nType == 0){
    url = "/users/" + selected_node.id;
    data.user = { username: selected_node.lbl};
  }else if(selected_node.nType == 1){
    url = "/resources/" + selected_node.id; 
    data.resource = {name: selected_node.lbl};
  }else{
    url = "/groups/" + selected_node.id;  
    data.group = {name: selected_node.lbl};
  }
  
  $.ajax({
     url: url,
     data: data,
     error: function() {
        alert('An error has occurred');
     },
     dataType: 'json',
     success: function(data) {
              updateLabel();
     },
     type: 'PUT'
  });
}

function updateLabel(){
  var text = d3.select("#text" + selected_node.id);
  text.text(selected_node.lbl);
  selected_node = null;
  restart();
}

function mousemove() {
  if(!mousedown_node) return;

  // update drag line
  drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);

  restart();
}

function mouseup() {
  if(mousedown_node) {
    // hide drag line
    drag_line
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  var toSplice = links.filter(function(l) {
    return (l.source.id === node.id || l.target.id === node.id);
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

// only respond once per keydown
var lastKeyDown = -1;

function keydown() {
//  d3.event.preventDefault();

  if(lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle.call(force.drag);
    svg.classed('ctrl', true);
  }

  if(!selected_node && !selected_link) return;
  switch(d3.event.keyCode) {
    case 8: // backspace
    case 46: // delete
      if(selected_link){
        links.splice(links.indexOf(selected_link), 1);
      }
      updateLinks(selected_link.source, selected_link.target, false);
      selected_link = null;
      selected_node = null;
      restart();
      break;
    case 66: // B
      if(selected_link) {
        // set link direction to both left and right
        selected_link.left = true;
        selected_link.right = true;
      }
      restart();
      break;
    case 76: // L
      if(selected_link) {
        // set link direction to left only
        selected_link.left = true;
        selected_link.right = false;
      }
      restart();
      break;
    case 82: // R
      if(selected_node) {
        // toggle node reflexivity
        selected_node.reflexive = !selected_node.reflexive;
      } else if(selected_link) {
        // set link direction to right only
        selected_link.left = false;
        selected_link.right = true;
      }
      restart();
      break;
  }
}

function updateLinks(sourceNode, targetNode, isCreate){

  var link = {
    source: {
      id: sourceNode.id,
      nType: sourceNode.nType
    },
    target: {
      id: targetNode.id,
      nType: targetNode.nType
    }
  };
  
  if(isCreate){
    $.ajax({
     url: '/graph/links',
     data: link, 
     error: function() {
        links.forEach(function(l){
          if(l.source.id == sourceNode.id && l.target.id == targetNode.id){
            links.splice(links.indexOf(l), 1);
            restart();
          }
        });
     },
     success: function(data) {
              selected_link.id = data.id;
              selected_link = null;
              selected_node = null;
              restart();
     },
     type: 'POST'
    });
  }else{
    $.ajax({
     url: "/graph/links",
     data: link,
     error: function() {
        alert('An error has occurred');
     },
     success: function(data) {
              selected_link = null;
              selected_node = null;
              restart();
     },
     type: 'DELETE'
  });
  }
}

function keyup() {
  lastKeyDown = -1;

  // ctrl
  if(d3.event.keyCode === 17) {
    circle
      .on('mousedown.drag', null)
      .on('touchstart.drag', null);
    svg.classed('ctrl', false);
  }
}

// app starts here
svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup);
d3.select(window)
  .on('keydown', keydown)
  .on('keyup', keyup);
restart();

function resetEditDialog(){
	$("#editNodeNameAlert").hide();
}

$("#editNodeDialog").on("hide.bs.modal", resetEditDialog);

$("#editNodeBtn").click(function(){
  if($("#editShortNodeNameTxt").val().trim() != ""){
		editNode();
		$("#editNodeDialog").modal("hide");
	}else{
		$("#editNodeNameAlert").show();
	}    
});

$('.test-request-form').each(function () {
  var $form = $(this);
  var btn = $form.find('.btn');
  var type = $form.data('type');
  var $result = $form.find('.result');
  var $identifier = $form.find('.identifier');
  btn.click(function () {
    $.ajax({
      url: '/graph/api',
      type: 'GET',
      dataType: 'json',
      data: {type: type, identifier: $identifier.val()},
      success: function(result){
        $result.text(JSON.stringify(result, null, 4));
      },
      error: function(){
        alert('No results.');
      }
    });
  });
})

});