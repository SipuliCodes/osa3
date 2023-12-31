require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))
app.use(cors())
app.use(express.static('dist'))

morgan.token('person', (req, res) => {
	return JSON.stringify(req.body)
})

app.get('/info', (req, res, next) => {

	Person.find({})
		.then(persons => {
			res.send(
				`<p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>`
			)
		})
		.catch(error => {
			next(error)
		})
})

app.get('/api/persons', (req, res, next) => {
	Person.find({}).then(persons => {
		res.json(persons)
	})
		.catch(error => {
			next(error)
		})
})

app.get('/api/persons/:id', (req, res, next) => {
	Person.findById(req.params.id)
		.then(person => {
			res.json(person)
		})
		.catch(error => {
			next(error)
		})
})

app.post('/api/persons', (req, res, next) => {
	const body = req.body

	if (!body.name) {
		return res.status(400).json({
			error: 'name missing'
		})
	}

	if (!body.number) {
		return res.status(400).json({
			error: 'number missing'
		})
	}

	const person = new Person({
		name: body.name,
		number: body.number
	})

	person.save().then(savedPerson => {
		res.json(savedPerson)
	}).catch(error => next(error))

})

app.delete('/api/persons/:id', (req, res, next) => {
	Person.findByIdAndRemove(req.params.id)
		.then(result => {
			res.status(204).end()
		})
		.catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
	const body = req.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate(req.params.id, person, { new: true })
		.then(updatedPerson => {
			console.log(updatedPerson)
			res.json(updatedPerson)
		})
		.catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
	console.log(error.message)

	if (error.name === 'CastError') {
		return res.status(400).send({ error: 'malformatted id' })
	} else if (error.name === 'ValidationError') {
		return res.status(400).json({ error: error.message })
	}

	next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
