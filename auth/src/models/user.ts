import mongoose from 'mongoose';
import { Password } from '../utils/password';

// props required to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

// describes the `User` model
// extends the base model and adds the static method `build` to make use of the `UserAttrs`
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    // mongoose way of creating DTO
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});
// `UserAttrs` interface serves the purpose of type-checking without being an `User` type
// this adds static props to the `User` model
userSchema.statics.build = (attrs: UserAttrs) => new User(attrs);

// `User` type usually has a few other fields e.g. `createdAt`, etc
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
