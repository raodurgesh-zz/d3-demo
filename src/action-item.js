export default [
  {
    label: "Add",
    icon: "./asset/icon_folder.svg",
    iconHover: "./asset/icon_folder_selected.svg",
    onClick: function(d) {
      console.log(d.data.id);
    }
  },
  {
    label: "Edit",
    icon: "./asset/rename.svg",
    iconHover: "./asset/rename_selected.svg",
    onClick: function(d) {
      console.log(d.data.id);
    }
  },
  {
    label: "Delete",
    icon: "./asset/delete.svg",
    iconHover: "./asset/delete_selected.svg",
    onClick: function(d) {
      console.log(d.data.id);
    }
  }
];
