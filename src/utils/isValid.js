const mongoose = require('mongoose')

exports.isObjectId = function (id) {
   return mongoose.Types.ObjectId.isValid(id)
}
