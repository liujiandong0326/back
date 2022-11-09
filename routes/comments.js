const router = require("@koa/router")();
const { Articles, Comments, Users } = require("../model");

const getComments = async function (ctx, next) {
  let result = await Comments.find();
  if (result.length) {
    ctx.body = {
      status: 1,
      msg: "success",
      body: result,
    };
  } else {
    ctx.body = {
      status: 0,
      msg: "no comments",
      body: [],
    };
  }
};

const postComment = async function (ctx, next) {
  let articleid = ctx.params.aid;
  console.log(articleid);

  let body = ctx.request.body;
  let { username, userid, title, content } = body;
  let article = await Articles.findOne({ _id: articleid });
  if (!article) {
    ctx.status = 400;
    ctx.body = {
      status: 0,
      msg: "article not exist",
    };
    return;
  }

  let newComment = new Comments({
    username,
    userid,
    title,
    content,
    articleid,
  });
  let result = await newComment.save();
  if (result) {
    ctx.body = {
      status: 1,
      msg: "success",
      data: { id: result.id },
    };
  } else {
    ctx.body = {
      status: 0,
      msg: "add comment error",
    };
  }
};

const getCommentById = async function (ctx, next) {
  let id = ctx.params.id;
  let result = await Comments.findOne({ _id: id });
  if (result) {
    ctx.body = {
      status: 1,
      msg: "success",
      body: result,
    };
  } else {
    ctx.body = {
      status: 0,
      msg: "comment not exist",
      body: {},
    };
  }
};
const getCommentsByAid = async function (ctx, next) {
  let articleid = ctx.params.aid;
  let result = await Comments.find({ articleid });

  if (result.length) {
    let usernames = result.map((item) => item.username); //抽取
    usernames = [...new Set(usernames)]; //去重
    let users = await Users.find({ username: { $in: usernames } });
    let hash = {};
    users.map((item) => {
      hash[item.username] = item.avatar;
    });
    result = result.map((item) => {
      item.avatar = hash[item.username];
      return item;
    });

    ctx.body = {
      status: 1,
      msg: "success",
      body: result,
    };
  } else {
    ctx.body = {
      status: 0,
      msg: "no comments",
      body: [],
    };
  }
};

const putCommentById = async function (ctx, next) {
  let id = ctx.params.id;
  let body = {};
  if (ctx.request.body.title !== undefined) body.title = ctx.request.body.title;
  if (ctx.request.body.content !== undefined)
    body.content = ctx.request.body.content;
  let result = await Comments.updateOne(
    {
      _id: id,
    },
    {
      $set: body,
    }
  );
  if (result) {
    ctx.body = {
      status: 1,
      msg: "success",
    };
  } else {
    ctx.body = {
      status: 0,
      msg: "update error",
    };
  }
};

const delCommentById = async function (ctx, next) {
  let id = ctx.params.id;
  let result = await Comments.deleteOne({ _id: id });
  if (result) {
    ctx.body = {
      status: 1,
      msg: "success",
    };
  } else {
    ctx.body = {
      status: 0,
      msg: "delete error",
    };
  }
};

router.prefix("/comments");
router.get("/", getComments);
router.get("/articles/:aid", getCommentsByAid);
router.post("/:aid", postComment);
router.get("/:id", getCommentById);
router.put("/:id", putCommentById);
router.delete("/:id", delCommentById);
module.exports = router;
