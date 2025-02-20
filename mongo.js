require('dotenv').config()
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const name = process.argv[3]
const number = process.argv[4]

if ((name && !number) || (!name && number)) {
  if (name) {
    console.log('number is undefined')
  } else {
    console.log('name is undefined')
  }
  process.exit(1)
}

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const newPerson = new Person({
  name: name,
  number: number,
})

if (process.argv.length < 4) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
} else {
  newPerson.save().then(() => {
    console.log('person saved!')
    mongoose.connection.close()
  })
}

module.exports = mongoose.Model(Person, personSchema)