import mqtt from "precompiled-mqtt";
import {useEffect, useState} from "react";
import './App.css'
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import {Slider} from "@mui/material";

function App() {
    const [msg, setMsg] = useState("");
    const [tempArray, setTempArray] = useState([])
    const [sliderValue, setSliderValue] = useState(24)
    const [setPoint, setSetPoint] = useState(sliderValue)
    const URL = 'wss://192.168.240.102';

    const publishOptions = {
        protocol: 'ws',
        username: 'joe',
        password: 'test',
        clientId: 'react-client',
        port: 9001,
        topic: 'test/t1',
        // keepAlive: 6000000,
        // reconnectPeriod: 60000*60
    }

    const subscribeOptions = {
        protocol: 'ws',
        username: 'joe',
        password: 'test',
        clientId: 'react-client',
        port: 9001,
        topic: 'testTopic',
        keepAlive: 6000000,
        reconnectPeriod: 60000*60
    };

    let client;

    useEffect( () => {

        client = mqtt.connect(URL, subscribeOptions)

        client.on('connect', () => {
            console.log("Connected to broker")
            client.subscribe('testTopic', function (err){
                if(!err){
                    client.publish("testTopic", 'MQTT connection established')
                    console.log("Subscribed to topic...")            // broker.subscribe('testTopic', function (err){
                }
                else{console.log("error: " + err)}
            })
        })
        client.on("message", function (topic, payload, packet) {
            let arr = [payload].toString()
            if(arr !== "MQTT connection established" ) {
                console.log([topic, payload].join(": "))
                setMsg(() => arr.toString())
                setTempArray(prevState => [...prevState, {
                    "time": Date(),
                    "temp": arr.toString()}
                ])
                console.log("msg received, new temperature: " + payload.toString() + " on topic: " + topic)
            }
        })

        client.on('packetsend', function (){
            console.log("Send messages with set point " + sliderValue)
        })

    },[setPoint]);

    const handleSliderChange = (event) => {
        let currentSetPoint = event.target.value
        setSliderValue(currentSetPoint)
    }

    const handleSetTemp = () => {
        if(setPoint !== sliderValue) {
            const client2 = mqtt.connect(URL, subscribeOptions)
            setSetPoint(sliderValue)
            client2.publish("test/t1", sliderValue.toString())
        }
        else{
            alert("The set point is already at " + setPoint + " degree celsius!")
        }
    }

    return (
        <div className="app-wrapper">
            <div className="content">
                <h1>The amazing temperature app</h1>
                <h2>Temperature: {msg.length === 0 ? "Awaiting data..." : msg.slice(0, 5) + " degree celsius"}</h2>
            </div>
            <LineChart className="chart" width={600} height={300} data={tempArray}>
                <Line type="monotone" dataKey="temp" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="time" />
                <YAxis dataKey="temp" />
            </LineChart>
            <h2>Set temperature</h2>
            <h3>Current set point: {setPoint}</h3>
            <Slider
                className="slider"
                min={16}
                max={32}
                step={1}
                marks={true}
                onChange={handleSliderChange}
                defaultValue={24}
                aria-label="Default"
                valueLabelDisplay="auto"/>
            <button className="set-temp-btn" onClick={handleSetTemp}>Set temperature</button>
        </div>
    );
}

export default App;