import axios from 'axios';
import { useState } from 'react';
import { Button, Input, Space, Table } from 'antd';
import Dropzone from '../components/Dropzone';


import ScheduleTable from '../components/ScheduleTable';
import InformationTable from '../components/InformationTable';

const styles = {
    form: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        borderRadius: '10px',
        backgroundColor: 'whitesmoke',
    },

    card: {
        color: 'black',
        padding: '40px',
        borderRadius: '10px',
        backgroundColor: 'whitesmoke',
    },

    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        padding: '40px',
    }
};




function Landing() {
    const [getId, setGetId] = useState('None');
    const [putId, setPutId] = useState('None');   
    const [putNo, setPutNo] = useState('None');
    const [delId, setDelId] = useState('None');

    const [getState, setGetState] = useState('');
    const [getMessage, setGetMessage] = useState('');
    const [putMessage, setPutMessage] = useState('');
    const [delMessage, setDelMessage] = useState('');

    const handleGetIdChange = (e) => setGetId(e.target.value)
    const handlePutIdChange = (e) => setPutId(e.target.value)
    const handlePutNoChange = (e) => setPutNo(e.target.value)
    const handleDelIdChange = (e) => setDelId(e.target.value)

    const handleInformationClick = () => { 
        axios.get(`http://localhost:5000/api/account/student/info/${getId}`)
        .then(response => {
            console.log('Response:', response.data);
            setGetMessage(response.data);
            setGetState("information");
        })
        .catch(error => {
            console.error('Error:', error);
            setGetMessage(error.message);
            setGetState("message");
        });

        
    }

    const handleSchedulesClick = () => { 
        axios.get(`http://localhost:5000/api/account/student/schedule/${getId}`)
        .then(response => {
            console.log('Response:', response.data);
            setGetMessage(response.data);
            setGetState("schedule");
        })
        .catch(error => {
            console.error('Error:', error);
            setGetMessage(error.message);
            setGetState("message");
        });
    }
    
    const handleNameClick = () => { 
        axios.get(`http://localhost:5000/api/account/student/name/${getId}`)
        .then(response => {
            console.log('Response:', response.data);
            setGetMessage(response.data);
            setGetState("name");
        })
        .catch(error => {
            console.error('Error:', error);
            setGetMessage(error.message);
            setGetState("message");
        });

    }

    const handleUpdateClick = () => { 
        axios.put(`http://localhost:5000/api/account/student/contact/${putId}/${putNo}`)
        .then(response => {
            console.log('Response:', response.data);
            setPutMessage(response.data.message);
        })
        .catch(error => {
            console.error('Error:', error);
            setPutMessage(error.message);
        });
    }
    
    const handleDeleteClick = () => { 
        axios.delete(`http://localhost:5000/api/account/student/remove/${delId}`)
        .then(response => {
            console.log('Response:', response.data);
            setDelMessage(response.data.message);
        })
        .catch(error => {
            console.error('Error:', error);
            setDelMessage(error.message);
        });
    }

    return (
        <div style={styles.container}>
            <div>
                <h2>Post</h2>
                <div style={styles.form}>
                    <Dropzone />
                </div>

                <br />

                <h2>Get</h2>
                <div style={styles.card}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <b>Student ID: {getId}</b>
                        <Input onChange={handleGetIdChange} placeholder="Find Student's ID Information" />
                        <Space style={{ width: '100%' }}>
                            <Button onClick={handleInformationClick} type="primary">Information</Button>
                            <Button onClick={handleSchedulesClick} type="primary">Schedules</Button>
                            <Button onClick={handleNameClick} type="primary">Name</Button>
                        </Space>
                    </Space>
                    <br />

                    {getMessage && getState == "information" && <InformationTable student={getMessage}/>}
                    {getMessage && getState == "schedule" && <ScheduleTable scheduleData={getMessage}/>}
                    {getMessage && getState == "name" && <><br/><p>{getMessage.first_name} {getMessage.last_name}</p></>}
                    {getMessage && getState == "message" && <><br/><p>{JSON.stringify(getMessage)}</p></>}
                </div>

                <br />

                <h2>Put</h2>
                <div style={styles.card}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <b>Student ID: {putId}</b>
                        <Input onChange={handlePutIdChange} placeholder="Student ID" />
                        <b>Contact No: {putNo}</b>
                        <Input onChange={handlePutNoChange} placeholder="Contact No" />
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button onClick={handleUpdateClick} type="primary">Update</Button>
                            <br />
                            <p>{putMessage}</p>
                            </Space>
                    </Space>
                </div>

                <br />

                <h2>Delete</h2>
                <div style={styles.card}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <b>Student ID: {delId}</b>
                        <Input onChange={handleDelIdChange} placeholder="Delete Student ID Information" />
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button danger onClick={handleDeleteClick} type="primary">Delete</Button>
                            <br />
                            <p>{delMessage}</p>
                        </Space>
                    </Space>
                </div>
            </div>
        </div>
    );
}




export default Landing;

