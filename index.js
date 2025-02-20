require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())


morgan.token('body', (req, res) => { return JSON.stringify(req.body) })
const post = ':method :url :status :res[content-length] - :response-time ms :body'
app.use((req, res, next) => {
    if (req.method === 'POST') {
        morgan(post)(req, res, next)
    } else {
        morgan('tiny')(req, res, next)
    }
})

// Transforms requests to make id usable
const transformPerson = (person) => {
    return {
        id: person._id.toString(),
        name: person.name,
        number: person.number
    }
}

// *** ROUTE HANDLERS *** //

//GET all entries
app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
        response.json(persons.map(person => transformPerson(person)))
    })
        .catch(error => next(error))
})

//GET specific entry
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(transformPerson(person))
        } else {
            response.status(404).end()
        }
    })
        .catch(error => next(error))
})

//GET information about how many entries there are
app.get('/info', (request, response, next) => {
    Person.countDocuments({}).then(count => {
        const currentTime = new Date()
        console.log(`Number of entries: ${count} at the time of ${currentTime}`)
        response.send(`
            <p>There are currently ${count} phonebook entries.</p>
            <p>${currentTime}</p>
        `)
    })
        .catch(error => next(error))
})

//DELETE existing entry
app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id).then(result => {
        response.status(204).end()
    })
        .catch(error => next(error))
})

//Create new entry
app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body.name) {
        return response.status(400).json({ error: 'name missing' })
    } else if (!body.number) {
        return response.status(400).json({ error: 'number is missing'})
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedPerson => {
            response.json(transformPerson(savedPerson))
        })
        .catch(error => next(error))
})

//Update existing entry
app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    Person.findByIdAndUpdate(
        request.params.id,
        { $set: { number: body.number } },
        { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(transformPerson(updatedPerson))
        }
    )
        .catch(error => next(error))   
})

// *** ERROR HANDLERS *** //
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

// *** SERVER STARTS HERE *** //

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})