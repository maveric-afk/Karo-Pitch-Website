import { useState, useEffect, useRef } from "react";
import {RouterProvider,createBrowserRouter} from 'react-router-dom'
import Home from './pages/Home'

const router=createBrowserRouter([
  {
    path:'/',
    element:<div>
      <Home/>
    </div>
  }
])

export default function App() {

  return (
    <div>
      <RouterProvider router={router}>

      </RouterProvider>
    </div>
  );
}
