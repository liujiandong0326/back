const router = require("@koa/router")();
const jwt = require("jsonwebtoken");
const { Users } = require("../model");
const { secret } = require("../secret");

const login = async function (ctx, next) {
  let { username, password } = ctx.request.body;
  let result = await Users.findOne({ username, password });

  if (result) {
    let token = jwt.sign(
      {
        nickname: result.nickname,
        role: result.role,
        userid: result.id,
        username: username, //payload 部分可解密获取，不能放敏感信息
      },
      secret.jwtsecret,
      {
        expiresIn: secret.expiresIn, // 授权时效 1 天
      }
    );
    ctx.body = {
      msg: "success",
      status: 1,
      token,
    };
  } else {
    ctx.status = 401;
    ctx.body = {
      msg: "login error",
      status: 0,
      token: null,
    };
  }
};

const signup = async function (ctx, next) {
  let { username, password, nickname } = ctx.request.body;
  let result = await Users.findOne({ username });
  if (result) {
    ctx.status = 401;
    ctx.body = {
      msg: "username exist",
      status: 0,
    };
    return;
  }
  var user = new Users({
    username,
    password,
    nickname,
  });

  // 使用 countDocuments() 方法去查一下 Users 表里的数据条数，如果没有用户的话，第一个注册用户就为管理员
  let isAdmin = await Users.countDocuments({});
  if (isAdmin == 0) user.role = "admin";

  await user.save();
  ctx.body = {
    msg: "success",
    status: 1,
  };
};

const info = async function (ctx, next) {
  let username = ctx.params.username;
  let result = await Users.findOne({ username });

  if (result) {
    ctx.body = {
      msg: "success",
      status: 1,
      data: {
        username: username,
        nickname: result.nickname,
        avatar: result.avatar,
      },
    };
  } else {
    ctx.status = 401;
    ctx.body = {
      msg: "error",
      status: 0,
    };
  }
};

const update = async function (ctx, next) {
  let { username, password, nickname, avatar } = ctx.request.body;

  let user = await Users.findOne({ username });
  if (!user) {
    ctx.status = 401;
    ctx.body = {
      status: 0,
      msg: "用户信息修改错误",
    };
  }

  let decode = ctx.state.user;
  let operatorUsername = decode.username;
  let role = decode.role;

  if (role == "admin" || operatorUsername == username) {
  } else {
    ctx.status = 401;
    ctx.body = {
      status: 0,
      msg: "无删除权限",
    };
    return;
  }

  let body = {};
  if (password) body.password = password;
  if (nickname) body.nickname = nickname;
  if (avatar || avatar === "") body.avatar = avatar;

  let result = await Users.updateOne(
    {
      username,
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

router.prefix("/users");
router.post("/login", login);
router.post("/signup", signup);
router.get("/info/:username", info);
router.post("/update", update);

module.exports = router;
