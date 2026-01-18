import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Header from './components/Header'
import VerifyOTP from './pages/VerifyOTP'
import Login from './pages/Login'
import RoomDetails from './pages/RoomDetails'
import AdminLayout from './components/layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import RoomManagement from './pages/admin/RoomManagement'
import RoomManagementDetails from './pages/admin/RoomManagementDetails'
import UserDetail from './pages/admin/UserDetail'
import OwnerLayout from './components/layouts/OwnerLayout'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import OwnerRoomManagement from './pages/owner/OwnerRoomManagement'
import AddRoom from './pages/owner/AddRoom'
import OwnerRoomDetail from './pages/owner/OwnerRoomDetail'
import Interested from './pages/owner/Interested'
import InterestedRoom from './pages/InterestedRoom'
function App() {

  return (
     <BrowserRouter>
      <Header/>
     <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/verifyotp' element={<VerifyOTP/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/rooms/:id' element={<RoomDetails/>}/>
      <Route path='/interested' element={<InterestedRoom/>}/>

      // admin Routes
      <Route path='/admin' element={<AdminLayout/>}> 
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path='dashboard' element={<AdminDashboard/>}/>
        <Route path='users' element={<UserManagement/>}/>
        <Route path='users/:id' element={<UserDetail/>}/>
        <Route path='rooms' element={<RoomManagement/>}/>
        <Route path='rooms/:id' element={<RoomManagementDetails/>}/>
      </Route> 

      // owner Routes
      <Route path='/owner' element={<OwnerLayout/>}> 
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path='dashboard' element={<OwnerDashboard/>}/>
        <Route path='rooms' element={<OwnerRoomManagement/>}/>
        <Route path='rooms/add' element={<AddRoom/>}/>
        <Route path='rooms/:id' element={<OwnerRoomDetail/>}/>
        <Route path='interested' element={<Interested/>}/>
      </Route>

     </Routes>
     </BrowserRouter>
  )
}

export default App
