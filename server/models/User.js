const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, minlength: 3 },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    avatar:   { type: String, default: '' },
    online:   { type: Boolean, default: false },
  },
  { timestamps: true }
)

// hash the password before saving so it's never stored as plain text
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// used at login to check the typed password against the hashed one
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

module.exports = mongoose.model('User', userSchema)
