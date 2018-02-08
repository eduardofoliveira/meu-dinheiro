const express = require('express')
const app = express()
const port = process.env.port || 3000

app.get('/', (req, res) => {
    res.send('Fullstack Academy !!!')
})

app.listen(port, () => console.log('Server running...'))