const router = require("@koa/router")();
const { Articles } = require("../model");

const getArticles = async function (ctx, next) {
  let result = await Articles.find();
  if (result.length) {
    ctx.body = {
      status: 1,
      msg: "success",
      body: result,
    };
  } else {
    ctx.body = {
      status: 0,
      msg: "no articles",
      body: [],
    };
  }
};

const postArticle = async function (ctx, next) {
  let body = ctx.request.body;
  let { username, userid, title, content } = body;
  let newArticle = new Articles({
    username,
    userid,
    title,
    content,
  });
  let result = await newArticle.save();
  if (result) {
    ctx.body = {
      status: 1,
      msg: "success",
      data: { id: result.id },
    };
  } else {
    ctx.body = {
      status: 0,
      msg: "add article error",
    };
  }
};

const getArticleById = async function (ctx, next) {
  let id = ctx.params.id;
  let result = await Articles.findOne({ _id: id });
  if (result) {
    ctx.body = {
      status: 1,
      msg: "success",
      body: result,
    };
  } else {
    ctx.body = {
      status: 0,
      msg: "article not exist",
      body: {},
    };
  }
};

const putArticleById = async function (ctx, next) {
  let id = ctx.params.id;

  let decode = ctx.state.user;
  // 只有admin 和 自己才可以删除文章
  if (decode.role == "admin") {
  } else {
    let owner = await Articles.findOne({ _id: id, username: decode.username });
    if (!owner) {
      ctx.status = 401;
      ctx.body = {
        status: 0,
        msg: "无删除权限",
      };
      return;
    }
  }

  let body = {};
  if (ctx.request.body.title !== undefined) body.title = ctx.request.body.title;
  if (ctx.request.body.content !== undefined)
    body.content = ctx.request.body.content;
  let result = await Articles.updateOne(
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

const delArticleById = async function (ctx, next) {
  let id = ctx.params.id;

  let decode = ctx.state.user;
  // 只有admin 和 自己才可以删除文章
  if (decode.role == "admin") {
  } else {
    let owner = await Articles.findOne({ _id: id, username: decode.username });
    if (!owner) {
      ctx.status = 401;
      ctx.body = {
        status: 0,
        msg: "无删除权限",
      };
      return;
    }
  }

  let result = await Articles.deleteOne({ _id: id });
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

router.prefix("/articles");
router.get("/", getArticles);
router.post("/", postArticle);
router.get("/:id", getArticleById);
router.put("/:id", putArticleById);
router.delete("/:id", delArticleById);

module.exports = router;
