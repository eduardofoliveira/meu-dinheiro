const express = require('express')
const app = express()
const port = process.env.port || 3000

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('home')
})

const calculoJuros = (p, i, n) => p*Math.pow(1+i, n)

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
    }

    res.render('calculadora', {resultado})
})

app.listen(port, () => console.log('Server running...'))