export default {
  nodes: [
    {
      id: "left1",
      width: 50,
      height: 50,
      left: true
    },
    {
      id: "left2",
      width: 50,
      height: 50,
      left: true
    },
    {
      id: "right1",
      width: 50,
      height: 50
    },
    {
      id: "right2",
      width: 50,
      height: 50
    }
  ],
  links: [
    {
      source: "left1",
      target: "right1",
      id: "link1"
    },
    {
      source: "left2",
      target: "right1",
      id: "link2"
    }
  ]
};
