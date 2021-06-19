const express = require('express')
const axios = require('axios')
const cron = require('node-cron')
const MongoClient = require('mongodb').MongoClient

const app = express()
app.listen(8000, (console.log('listening on port 8000')))
app.use(express.json())


const url = 'mongodb://localhost:27017'
const dbName = 'studyCase'

MongoClient.connect(url)
    .then (client => {
        console.log("Connected successfully to server")
        db = client.db(dbName)
    })
    .catch(error => console.log(error))
    
let access_token = 'a1b2c3d4-a1b2-a1b2-a1b2-a1b2c3d4e5f6'
let base_url = 'https://api.mercedes-benz.com/experimental/connectedvehicle_tryout/v2/vehicles/'
let vehicle_id = '1234567890ABCD1234'

// Get vehicule data 
axios.get(`${base_url}${vehicle_id}`, {
    headers: {
        Authorization: 'Bearer ' + access_token
    }
}).then(response => { 
    // Save data to database
    console.log(response.data)
    const vehiclesCollection = db.collection('vehicles')
    vehiclesCollection.insertOne(response.data) 
    // Return details in a get method 
    app.get(`/${vehicle_id}/details`, (req , res) => {
        res.json(response.data)
    } )  

}).catch(error => {
    console.log(error)
})

// Get Dynamic data every minutes
cron.schedule('* * * * *', ()=>{
    let dynamic_data = {
        tires_data    :  null,
        doors_data    : null,
        location_data : null,
        odometer_data : null, 
        fuel_data     : null, 
        charge_data   : null
    }
    
    
    // Get Tire States data 
    axios.get(`${base_url}${vehicle_id}/tires`, {
        headers: {
            Authorization: 'Bearer ' + access_token, 
            Accept : 'application/json'
        }
    }).then(response => { 
        dynamic_data['tires_data']= response.data  
        // Return data in a get method 
        app.get(`/${vehicle_id}/tires`, (req , res) => {
            res.json(response.data)
        } )  
    }).catch(error => {
        console.log(error)
         
    })
    
    // Get doors data 
    axios.get(`${base_url}${vehicle_id}/doors`, {
        headers: {
            Authorization: 'Bearer ' + access_token, 
            accept : 'application/json'
        }
    }).then(response => { 
        dynamic_data['doors_data'] = response.data  
        // Return data in a get method 
        app.get(`/${vehicle_id}/doors`, (req , res) => {
            res.json(response.data)
        } )  
    }).catch(error => {
        console.log(error)
         
    })
    
    // Get location data 
    axios.get(`${base_url}${vehicle_id}/location`, {
        headers: {
            Authorization: 'Bearer ' + access_token, 
            accept : 'application/json'
        }
    }).then(response => { 
        dynamic_data['location_data'] = response.data  
        // Return data in a get method 
        app.get(`/${vehicle_id}/location`, (req , res) => {
            res.json(response.data)
        } )  
    }).catch(error => {
        console.log(error)
         
    })
    
    // Get odometer data
    axios.get(`${base_url}${vehicle_id}/odometer`, {
        headers: {
            Authorization: 'Bearer ' + access_token, 
            accept : 'application/json'
        }
    }).then(response => { 
        dynamic_data['odometer_data'] = response.data  
        // Return data in a get method 
        app.get(`/${vehicle_id}/odometer`, (req , res) => {
            res.json(response.data)
        } )  
    }).catch(error => {
        console.log(error)
         
    })
    
    // Get fuel data 
    axios.get(`${base_url}${vehicle_id}/fuel`, {
        headers: {
            Authorization: 'Bearer ' + access_token, 
            accept : 'application/json'
        }
    }).then(response => { 
        dynamic_data['fuel_data'] = response.data  
        // Return data in a get method 
        app.get(`/${vehicle_id}/fuel`, (req , res) => {
            res.json(response.data)
        } )  
    }).catch(error => {
        console.log(error)
         
    })
    
    // Get charge data 
    axios.get(`${base_url}${vehicle_id}/stateofcharge`, {
        headers: {
            Authorization: 'Bearer ' + access_token, 
            accept : 'application/json'
        }
    }).then(response => { 
        dynamic_data['charge_data']= response.data 
        // Return data in a get method 
        app.get(`/${vehicle_id}/stateofcharge`, (req , res) => {
            res.json(response.data)
        } )   
    }).catch(error => {
        console.log(error)
         
    })
       
    setTimeout(() => {
        console.log(dynamic_data)
        const vehicleDataCollection = db.collection(`${vehicle_id}`)
        vehicleDataCollection.insertOne(dynamic_data) 
    } , 2000)
}) 

// Change Doors status (LOCK/UNLOCK)
app.post(`/${vehicle_id}/doors/change`, (req, res) => {
    // Validate request
    if(!req.body.command) {
        return res.status(400).send({
            message: "Note content can not be empty"
        });
    }

    // Get command value 
    let command = req.body.command

    // Send request update to Mercedes API 
    axios.post(`${base_url}${vehicle_id}/doors`, 
        {
            data : { 
                command : command
            } 
        },
        {
            headers: {
                'Authorization': 'Bearer ' + access_token, 
                'Content-Type' : 'application/json'
            }
        }
    ).then(response => {
        return res.status(200).send({
            message: "Status updated"
        });
    })
    .catch(error => {
        console.log(error)
         
    })
})

