const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const port = process.env.port || 3000
const url = 'mongodb://192.168.3.30:27017'
const dbName = 'meu-dinheiro'

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('home')
})

const calculoJuros = (p, i, n) => p*Math.pow(1+i, n)
const evolucao = (p, i, n) => Array.from(new Array(n), (n, i) => i + 1)
    .map(mes => {
        return  {
            mes,
            juros: calculoJuros(p, i, mes)
        }
    })

app.get('/calculadora', (req, res) => {
    const resultado = {
        calculado: false
    }
    if(req.query.valorInicial && req.query.taxa && req.query.tempo){
        resultado.calculado = true
        resultado.total = calculoJuros(
            parseFloat(req.query.valorInicial),
            parseFloat(req.query.taxa)/100,
            parseInt(req.query.tempo)
        )
        resultado.evolucao = evolucao(
            parseFloat(req.query.valorInicial),
            parseFloat(req.query.taxa)/100,
            parseInt(req.query.tempo)
        )
    }

    res.render('calculadora', {resultado})
})

const findAll = (db, collectionName) => {
    const collection = db.collection(collectionName)
    const cursor = collection.find({})
    const documents = []

    return new Promise((resolve, reject) => {
        cursor.forEach(
            (doc) => documents.push(doc),
            () => resolve(documents)
        )
    })
}

const insert = (db, collectionName, document) => {
    const collection = db.collection(collectionName)
    return new Promise((resolve, reject) => {
        collection.insert(document, (err, doc) => {
            if(err){
                reject(err)
            }else{
                resolve(doc)
            }
        })
    })
}

const subtotal = operacoes => {
    let sub = 0
    return operacoes.map(operacao => {
        sub += operacao.valor
        let newOperacao = {
            valor: operacao.valor,
            descricao: operacao.descricao,
            sub: sub
        }
        return newOperacao
    })
}

app.get('/operacoes', async (req, res) => {
    const operacoes = await findAll(app.db, 'operacoes')
    const newOperacoes = subtotal(operacoes)
    res.render('operacoes', {operacoes: newOperacoes})
})

app.get('/nova-operacao', (req, res) => {
    res.render('nova-operacao')
})
app.post('/nova-operacao', async (req, res) => {
    const operacao = {
        descricao: req.body.descricao,
        valor: parseFloat(req.body.valor)
    }
    const newOperacao = await insert(app.db, 'operacoes', operacao)
    res.redirect('/operacoes')
})

MongoClient.connect(url, (err, client) => {
    if(err){
        return
    }else{
        app.db = client.db(dbName)
        app.listen(port, () => console.log('Server running...'))
    }
})

// Aula 3 56:29