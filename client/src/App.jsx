import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Header from './components/Header'
import VerifyOTP from './pages/VerifyOTP'
import Login from './pages/Login'
function App() {

  return (
     <BrowserRouter>
      <Header/>
     <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/verifyotp' element={<VerifyOTP/>}/>
      <Route path='/login' element={<Login/>}/>
     </Routes>
     </BrowserRouter>
  )
}

export default App
