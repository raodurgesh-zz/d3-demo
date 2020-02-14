import { select } from "d3";

function geIconClass(d, type) {
  if (type == "arrow") {
    return d.children ? "arrow-down" : d._children ? "arrow-up" : "";
  }
  if (type == "folder") {
    return d.data.active ? "folder-selected" : "folder";
  } else {
    return "file";
  }
}

function wrapText(width) {
  var self = select(this),
    textLength = self.node().getComputedTextLength(),
    text = self.text();
  while (textLength > width && text.length > 0) {
    text = text.slice(0, -1);
    self.text(text + "...");
    textLength = self.node().getComputedTextLength();
  }
}

function getImageCord(type) {
  let cord;
  switch (type) {
    case "arrow":
      cord = { x: -35, y: -5, width: 10, height: 10 };
      break;
    case "folder":
      cord = { x: -20, y: -10, width: 20, height: 20 };
      break;
    case "file":
      cord = { x: -30, y: -10, width: 20, height: 20 };
      break;
    default:
      cord = { x: -30, y: -10, width: 20, height: 20 };
      break;
  }
  return cord;
}

function addImage({ d, type }) {
  let cord = getImageCord(type);
  let imageUrl = getImageUrl(d, type);
  if (!imageUrl) return;
  select(this)
    .append("image")
    .attr("class", d => `svg-image ${geIconClass(d, type)}`)
    .attr("x", cord.x)
    .attr("y", cord.y)
    .attr("width", cord.width)
    .attr("height", cord.height)
    .attr("xlink:href", d => imageUrl);
}

function addNodeText({
  isFolder,
  margin,
  width,
  fileNameXOffest,
  folderNameXOffest
}) {
  let textNode = select(this)
    .append("text")
    .attr("dy", 3.5)
    .attr("dx", isFolder ? folderNameXOffest : fileNameXOffest)
    .attr("class", "node-title")
    .text(d => d.data.name)
    .each(function(d) {
      wrapText.call(this, width - d.y - margin.right);
    });

  textNode.classed("selected", d => d.data.active);
}

function addTooltip() {
  select(this)
    .append("svg:title")
    .text(d => d.data.name);
}

export function getImageUrl(d, type) {
  let url = "";

  let iconType = geIconClass(d, type);

  switch (iconType) {
    case "arrow-up":
      url = "./asset/icon_caret_right_Shuttle_Grey.svg";
      break;
    case "arrow-down":
      url = "./asset/icon_caret_down_Shuttle_Grey.svg ";
      break;
    case "folder-selected":
      url = "./asset/icon_folder_selected.svg";
      break;
    case "folder":
      url = "./asset/icon_folder.svg";
      break;
    case "file":
      url = "./asset/file.svg";
      break;
  }
  return url;
}

export function getActionMenu(actionItem) {
  let actionMenu = null;
  let clickAction = [];

  function gerenateActionMenu() {
    clickAction = [];
    var list = document.createElement("UL");
    actionItem.map(function(a) {
      var listItem = document.createElement("LI");
      var icon = document.createElement("img");
      icon.src = a.icon;
      listItem.addEventListener("mouseenter", function() {
        icon.src = a.iconHover;
      });
      listItem.addEventListener("mouseleave", function() {
        icon.src = a.icon;
      });
      listItem.appendChild(icon);
      listItem.append(a.label);
      clickAction.push({ item: listItem, action: a.onClick });
      list.appendChild(listItem);
    });
    return list;
  }

  return function(d) {
    clickAction.forEach(o => {
      o.item.removeEventListener("click", o.fn);
    });
    if (!actionMenu) actionMenu = gerenateActionMenu();
    clickAction.forEach(o => {
      o.fn = function() {
        o["action"](d);
      };
      o.item.addEventListener("click", o.fn);
    });
    return actionMenu;
  };
}

export function addNodeContent({
  width,
  margin,
  folderNameXOffest,
  fileNameXOffest
}) {
  let filteredNode = this.filter(d => d && d.data && d.data.name);

  filteredNode.each(function(d) {
    let isFolder = d._children || d.children;

    if (isFolder) {
      addImage.call(this, { d, isFolder, type: "arrow" });
      addImage.call(this, { d, isFolder, type: "folder" });
    } else {
      addImage.call(this, { d, isFolder, type: "file" });
    }
    addNodeText.call(this, {
      isFolder,
      margin,
      width,
      folderNameXOffest,
      fileNameXOffest
    });

    addTooltip.call(this);
  });
}
