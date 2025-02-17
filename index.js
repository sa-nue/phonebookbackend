const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
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

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    console.log(`Requested ID: ${id}`)
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.statusMessage = "No entry found"
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    const personsQuantity = persons.length
    const currentTime = new Date()
    console.log(`Numbers of entries: ${personsQuantity} at the time of ${currentTime}`)
    response.send(`
        <p>There are currently ${personsQuantity} phonebook entries.</p>
        <p>${currentTime}</p>
    `);
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    const nameExists = persons.some(person => person.name === body.name)
    if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    } else if (nameExists) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    const newEntry = {
        name: body.name,
        number: body.number,
        id: generateID()
    }
    persons = persons.concat(newEntry)
    response.json(newEntry)
})

const generateID = () => {
    const id = persons.length > 0
        ? Math.floor(Math.random() * 9999)
        : 0
    return String(id)
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

            //Update for commit