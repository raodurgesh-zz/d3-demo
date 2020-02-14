import { select, hierarchy, easeLinear, transition, event } from "d3";
import { getImageUrl, addNodeContent, getActionMenu } from "./util";
import actionItem from "./action-item";
import "./treelist.css";

let parent = document.querySelector(".tree-view");

let actionBox = parent.querySelector(".action-box");

let actionMenu = getActionMenu(actionItem);

let margin = { top: 10, right: 20, bottom: 30, left: 20 },
  width = 300,
  barYOffset = 33,
  fileNameXOffest = -5, //-35,
  folderNameXOffest = 5.5,
  barXOffset = 30,
  _id = 0,
  duration = 500,
  closeOther = false,
  root,
  svgElm,
  treeData;

let nodeEnterTransition = transition()
  .duration(duration)
  .ease(easeLinear);

export default function Treelist(data, config = {}) {
  margin = config.margin || margin;
  width = config.width || width;
  barYOffset = config.barYOffset || barYOffset;
  barXOffset = config.barXOffset || barXOffset;
  duration = config.duration || duration;
  closeOther = config.closeOther || closeOther;
  fileNameXOffest = config.fileNameXOffest || fileNameXOffest;
  folderNameXOffest = config.folderNameXOffest || folderNameXOffest;
  treeData = data;

  svgElm = getSVG();

  function getSVG() {
    return select(".start")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", 1000)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  }

  initTreelist();
}

function hideActionMenu() {
  if (parent.querySelector(".hovered")) {
    actionBox.style.display = "none";
    parent.querySelector(".hovered").classList.remove("hovered");
  }
}

document.addEventListener("click", () => {
  hideActionMenu();
});

actionBox.addEventListener("mouseleave", () => {
  hideActionMenu();
});

function toogleChildern(d) {
  if (!d.data.name) {
    return;
  }
  if (d._children) {
    showChildern(d);
  } else {
    hideChildren(d);
  }
}

function hideChildren(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  }
}

function showChildern(d) {
  if (d._children) {
    d.children = d._children;
    d._children = null;
  }
}

function renderActionTrigger(d) {
  if (!d.children && !d._children) return;
  let container = this.closest("g");
  let cord = container.getBBox();

  let actionTriggerG = select(container)
    .selectAll(".action-trigger")
    .data([1])
    .enter()
    .append("g")
    .attr("class", "action-trigger")
    .attr(
      "transform",
      "translate(" + (cord.width + cord.x - 20) + "," + -10 + ")"
    );

  // actionTriggerG.append("svg:title").text("action");

  actionTriggerG
    .selectAll("circle")
    .data([1, 2, 3])
    .enter()
    .append("circle")
    .attr("r", 2)
    .attr("cx", 5)
    .attr("cy", d => d * 5);

  actionTriggerG
    .selectAll("rect")
    .data([1])
    .enter()
    .append("rect")
    .attr("width", 10)
    .attr("height", 20);

  actionTriggerG.on("click", () => {
    event.stopPropagation();
    select(container).classed("hovered", true);
    actionBox.appendChild(actionMenu(d));
    actionBox.style.display = "block";
    actionBox.style.left = event.pageX - actionBox.clientWidth + 2 + "px";
    actionBox.style.top = event.pageY - 2 + "px";
  });
}

function addBackgroundRect(barXOffset, width, margin) {
  let filteredNode = this.filter(d => d && d.data && d.data.name);
  if (!filteredNode.node()) return;
  let cord = filteredNode.node().getBBox();

  filteredNode
    .append("rect")
    .attr("x", d => {
      return -barXOffset * d.depth - margin.left;
    })
    .attr("y", cord.y - 2)
    .attr("rx", 2)
    .attr("height", cord.height + 5)
    .attr("width", width)
    .attr("class", "node-background");
}

function enterBehaviour(node, source) {
  var nodeEnter = node
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", () => "translate(" + source.y0 + "," + source.x0 + ")")
    .on("click", onNodeClick);

  // adding images & text-content to node

  addNodeContent.call(nodeEnter, {
    width,
    margin,
    fileNameXOffest,
    folderNameXOffest
  });

  // renderTreelist : Transition nodes to their new position.
  nodeEnter
    .transition(nodeEnterTransition)
    .attr("transform", d => "translate(" + d.y + "," + d.x + ")")
    .style("opacity", 1);

  addBackgroundRect.call(nodeEnter, barXOffset, width, margin);

  // adding action-trigger action button

  nodeEnter.each(function(d) {
    renderActionTrigger.call(this, d);
  });
}

function updateBehaviour(node) {
  node
    .transition()
    .duration(duration)
    .attr("transform", d => "translate(" + d.y + "," + d.x + ")")
    .style("opacity", 1);

  node
    .selectAll("[class*='folder']")
    .attr("xlink:href", d => getImageUrl(d, "folder"));

  node
    .selectAll("[class*='arrow']")
    .attr("xlink:href", d => getImageUrl(d, "arrow"));

  node
    .selectAll("[class*='node-title']")
    .classed("selected", d => d.data.active);
}

function exitBehaviour(node, source) {
  node
    .exit()
    .transition()
    .duration(duration)
    .attr("transform", () => "translate(" + source.y + "," + source.x + ")")
    .style("opacity", 0)
    .remove();
}

function onNodeClick(node) {
  toogleChildern(node);
  root.descendants().forEach(d => {
    d.data.active = false;
  });
  node.data.node.ancestors().forEach(d => {
    d.data.active = true;
  });
  if (closeOther) {
    root.descendants().forEach(d => {
      if (!d.data.name) return;
      if (!d.data.active) {
        hideChildren(d);
      }
    });
  }
  renderTreelist(node);
}

function renderTreelist(source) {
  var index = -1;
  var nodes = root.descendants();

  var height = Math.max(
    500,
    nodes.length * barYOffset + margin.top + margin.bottom
  );

  select("svg")
    .transition()
    .attr("height", height);

  root.eachBefore(n => {
    n.x = ++index * barYOffset;
    n.y = n.depth * barXOffset;
  });

  var node = svgElm.selectAll(".node").data(nodes, d => {
    return d.data.id || (d.data.id = ++_id);
  });

  node.selectAll("[class*='folder']").data(nodes, d => {
    return d.data.id || (d.data.id = ++_id);
  });

  node.selectAll("[class*='arrow']").data(nodes, d => {
    return d.data.id || (d.data.id = ++_id);
  });

  enterBehaviour(node, source);

  updateBehaviour(node);

  exitBehaviour(node, source);

  root.each(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

export function initTreelist(selectedNodeId) {
  let selectedNode = null;
  root = hierarchy(treeData);
  root.descendants().forEach(d => {
    if (!d.data.name) return;
    d.data.node = d;
    d.data.active = false;
    hideChildren(d);
    if (d.data.id === selectedNodeId) {
      selectedNode = d;
    }
  });

  if (selectedNode) {
    selectedNode.data.node.ancestors().forEach(d => {
      d.data.active = true;
      showChildern(d);
    });
  }

  root.x0 = 0;
  root.y0 = 0;

  renderTreelist(root);

  return root;
}
