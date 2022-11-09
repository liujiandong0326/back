const db = require("./db"); //引入Mongoose
const Schema = db.Schema;

const UserSchema = new Schema(
  {
    username: String,
    nickname: String,
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    password: String,
    avatar: String,
  },
  { timestamps: true }
);

const ArticleSchema = new Schema(
  {
    userid: String,
    username: String,
    title: String,
    content: String,
  },
  { timestamps: true } // 自动增加两个字段 createdAt 和 updatedAt
);

const CommentSchema = new Schema(
  {
    userid: String,
    username: String,
    title: String,
    content: String,
    articleid: String,
    avatar: String,
  },
  { timestamps: true }
);

const Users = db.model("User", UserSchema);
const Articles = db.model("Article", ArticleSchema);
const Comments = db.model("Comment", CommentSchema);
module.exports = { Users, Articles, Comments };
