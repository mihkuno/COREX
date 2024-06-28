import { useState } from 'react';
import { Button, Input, Space } from 'antd';
import Dropzone from '../components/Dropzone';
import { LineHeightOutlined } from '@ant-design/icons';

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

    const handleGetIdChange = (e) => setGetId(e.target.value)
    const handlePutIdChange = (e) => setPutId(e.target.value)
    const handlePutNoChange = (e) => setPutNo(e.target.value)
    const handleDelIdChange = (e) => setDelId(e.target.value)


    const handleInformationClick = () => {  }
    const handleSchedulesClick = () => {  }
    const handleNameClick = () => {  }
    const handleUpdateClick = () => {  }
    const handleDeleteClick = () => {  }

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
                </div>

                <br />

                <h2>Put</h2>
                <div style={styles.card}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <b>Student ID: {putId}</b>
                        <Input onChange={handlePutIdChange} placeholder="Student ID" />
                        <b>Contact No: {putNo}</b>
                        <Input onChange={handlePutNoChange} placeholder="Contact No" />
                        <Button onClick={handleUpdateClick} type="primary">Update</Button>
                    </Space>
                </div>

                <br />

                <h2>Delete</h2>
                <div style={styles.card}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <b>Student ID: {delId}</b>
                        <Input onChange={handleDelIdChange} placeholder="Delete Student ID Information" />
                        <Button danger onClick={handleDeleteClick} type="primary">Delete</Button>
                    </Space>
                </div>
            </div>
        </div>
    );
}

export default Landing;
