import React from 'react'
import ReactDOM from 'react-dom/client'
import Landing from './screens/Landing'
import './styles/global.css'

function Root() {
    return (
        <React.StrictMode>
        <Landing />
        </React.StrictMode>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root/>,)



